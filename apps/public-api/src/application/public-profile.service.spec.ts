import { ApiKeyScope } from '../domain/api-key';
import { ProfileCursor } from '../domain/cursor';
import { NameDisplayOrder } from '../domain/display-name';
import { Visibility } from '../domain/effective-public';
import { ForbiddenError, NotFoundError, ValidationError } from '../domain/errors';
import { UserStatus } from '../domain/user-status';
import {
	ApiKeyRepository,
	Clock,
	IdGenerator,
	ProfileListFilter,
	ProfileRepository,
	SnsLinkRepository,
	UserRepository
} from './gateways';
import { ApiKeyRecord, ApiPrincipal, ProfileRecord, SnsLinkRecord, UserRecord } from './models';
import { PublicProfileService } from './public-profile.service';

// --- テスト用フェイク(Gateway 境界で差し替え。決定論的、testing/01 §3) ---

class FakeUserRepository implements UserRepository {
	readonly users = new Map<string, UserRecord>();
	async findById(id: string): Promise<UserRecord | null> {
		return this.users.get(id) ?? null;
	}
}

class FakeApiKeyRepository implements ApiKeyRepository {
	readonly keys = new Map<string, ApiKeyRecord>();
	readonly touched: { keyId: string; usedAt: Date }[] = [];
	async findByKeyHash(keyHash: string): Promise<ApiKeyRecord | null> {
		return this.keys.get(keyHash) ?? null;
	}
	async touchLastUsed(keyId: string, usedAt: Date): Promise<void> {
		this.touched.push({ keyId, usedAt });
	}
}

class FakeProfileRepository implements ProfileRepository {
	readonly profiles = new Map<string, ProfileRecord>();
	constructor(private readonly users: FakeUserRepository) {}

	async findByUserId(userId: string): Promise<ProfileRecord | null> {
		return [...this.profiles.values()].find((p) => p.userId === userId) ?? null;
	}
	async findByHandle(handle: string): Promise<ProfileRecord | null> {
		return [...this.profiles.values()].find((p) => p.handle === handle) ?? null;
	}
	async save(profile: ProfileRecord): Promise<void> {
		this.profiles.set(profile.id, profile);
	}
	async listEffectivePublic(filter: ProfileListFilter): Promise<ProfileRecord[]> {
		let rows = [...this.profiles.values()].filter((p) => {
			const owner = this.users.users.get(p.userId);
			return p.visibility === Visibility.PUBLIC && owner?.status === UserStatus.ACTIVE;
		});
		rows.sort((a, b) => {
			const t = b.updatedAt.getTime() - a.updatedAt.getTime();
			return t !== 0 ? t : b.id.localeCompare(a.id);
		});
		if (filter.cursor) {
			rows = rows.filter((p) => isAfterCursor(p, filter.cursor!));
		}
		return rows.slice(0, filter.limit);
	}
}

function isAfterCursor(p: ProfileRecord, cursor: ProfileCursor): boolean {
	const pu = p.updatedAt.toISOString();
	if (pu < cursor.updatedAt) return true;
	if (pu > cursor.updatedAt) return false;
	return p.id < cursor.id;
}

class FakeSnsLinkRepository implements SnsLinkRepository {
	readonly byProfile = new Map<string, SnsLinkRecord[]>();
	async findByProfileIds(profileIds: readonly string[]): Promise<SnsLinkRecord[]> {
		return profileIds.flatMap((id) => this.byProfile.get(id) ?? []);
	}
	async replaceForProfile(profileId: string, links: readonly SnsLinkRecord[]): Promise<void> {
		this.byProfile.set(profileId, [...links]);
	}
}

class FixedClock implements Clock {
	constructor(private value: Date) {}
	now(): Date {
		return this.value;
	}
	set(value: Date): void {
		this.value = value;
	}
}

class SeqIdGenerator implements IdGenerator {
	private n = 0;
	ulid(): string {
		this.n += 1;
		return `01J${this.n.toString().padStart(23, '0')}`;
	}
}

// --- テストハーネス ---

interface Harness {
	service: PublicProfileService;
	users: FakeUserRepository;
	apiKeys: FakeApiKeyRepository;
	profiles: FakeProfileRepository;
	snsLinks: FakeSnsLinkRepository;
	clock: FixedClock;
}

function makeHarness(): Harness {
	const users = new FakeUserRepository();
	const apiKeys = new FakeApiKeyRepository();
	const profiles = new FakeProfileRepository(users);
	const snsLinks = new FakeSnsLinkRepository();
	const clock = new FixedClock(new Date('2026-06-17T00:00:00.000Z'));
	const service = new PublicProfileService({
		users,
		apiKeys,
		profiles,
		snsLinks,
		clock,
		ids: new SeqIdGenerator()
	});
	return { service, users, apiKeys, profiles, snsLinks, clock };
}

function seedUser(h: Harness, id: string, status: UserStatus): void {
	h.users.users.set(id, { id, status });
}

function seedProfile(
	h: Harness,
	overrides: Partial<ProfileRecord> & { id: string; userId: string }
): ProfileRecord {
	const profile: ProfileRecord = {
		handle: `handle-${overrides.id}`,
		visibility: Visibility.PUBLIC,
		iconImageId: null,
		firstName: 'みなと',
		lastName: '里中',
		nameDisplayOrder: NameDisplayOrder.GIVEN_FIRST,
		occupation: null,
		searchName: 'みなと 里中',
		bio: null,
		createdAt: new Date('2026-06-01T00:00:00.000Z'),
		updatedAt: new Date('2026-06-01T00:00:00.000Z'),
		...overrides
	};
	h.profiles.profiles.set(profile.id, profile);
	return profile;
}

const principal = (userId: string, scope: ApiKeyScope): ApiPrincipal => ({
	keyId: `key-${userId}`,
	userId,
	status: UserStatus.ACTIVE,
	scope
});
const fullKey = (userId: string): ApiPrincipal => principal(userId, ApiKeyScope.FULL);
const readKey = (userId: string): ApiPrincipal => principal(userId, ApiKeyScope.READ);

describe('PublicProfileService.getPublicProfileByHandle(実効公開ゲート・AC-API-006/007)', () => {
	test('実効公開のプロフィールを SNS リンク付きで返す', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1', handle: 'taro' });
		h.snsLinks.byProfile.set('p1', [
			{
				id: 'l1',
				profileId: 'p1',
				platform: 'github',
				url: 'https://github.com/taro',
				label: null,
				sortOrder: 0,
				createdAt: new Date()
			}
		]);
		const result = await h.service.getPublicProfileByHandle('taro');
		expect(result.profile.id).toBe('p1');
		expect(result.snsLinks).toHaveLength(1);
	});

	test('存在しないハンドルは NotFound(秘匿)', async () => {
		const h = makeHarness();
		await expect(h.service.getPublicProfileByHandle('none')).rejects.toBeInstanceOf(NotFoundError);
	});

	test('未確認ユーザーは NotFound で秘匿', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.UNVERIFIED);
		seedProfile(h, { id: 'p1', userId: 'u1', handle: 'hidden' });
		await expect(h.service.getPublicProfileByHandle('hidden')).rejects.toBeInstanceOf(
			NotFoundError
		);
	});

	test('非公開は NotFound で秘匿', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1', handle: 'hidden', visibility: Visibility.PRIVATE });
		await expect(h.service.getPublicProfileByHandle('hidden')).rejects.toBeInstanceOf(
			NotFoundError
		);
	});

	test('凍結ユーザーは NotFound で秘匿', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.FROZEN);
		seedProfile(h, { id: 'p1', userId: 'u1', handle: 'frozen' });
		await expect(h.service.getPublicProfileByHandle('frozen')).rejects.toBeInstanceOf(
			NotFoundError
		);
	});
});

describe('PublicProfileService.getMyProfile(本人取得・AC-API-005)', () => {
	test('非公開でも本人は取得できる', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1', visibility: Visibility.PRIVATE });
		const result = await h.service.getMyProfile(readKey('u1'));
		expect(result.profile.id).toBe('p1');
	});

	test('プロフィールが無ければ NotFound', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		await expect(h.service.getMyProfile(readKey('u1'))).rejects.toBeInstanceOf(NotFoundError);
	});
});

describe('PublicProfileService.listPublicProfiles(カーソルページング・BR-API-007)', () => {
	test('実効公開のみを返し非公開/未確認を除外する', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedUser(h, 'u2', UserStatus.UNVERIFIED);
		seedUser(h, 'u3', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		seedProfile(h, { id: 'p2', userId: 'u2' });
		seedProfile(h, { id: 'p3', userId: 'u3', visibility: Visibility.PRIVATE });
		const result = await h.service.listPublicProfiles({});
		expect(result.items.map((i) => i.profile.id)).toEqual(['p1']);
		expect(result.hasMore).toBe(false);
		expect(result.nextCursor).toBeNull();
	});

	test('first を超える件があるとき hasMore=true・nextCursor で続きを取得できる', async () => {
		const h = makeHarness();
		for (let i = 1; i <= 3; i += 1) {
			seedUser(h, `u${i}`, UserStatus.ACTIVE);
			seedProfile(h, {
				id: `p${i}`,
				userId: `u${i}`,
				updatedAt: new Date(`2026-06-0${i}T00:00:00.000Z`)
			});
		}
		const first = await h.service.listPublicProfiles({ first: 2 });
		expect(first.items.map((i) => i.profile.id)).toEqual(['p3', 'p2']); // 新着順
		expect(first.hasMore).toBe(true);
		expect(first.nextCursor).not.toBeNull();

		const second = await h.service.listPublicProfiles({ first: 2, after: first.nextCursor! });
		expect(second.items.map((i) => i.profile.id)).toEqual(['p1']);
		expect(second.hasMore).toBe(false);
	});
});

describe('PublicProfileService.replaceMyProfile(PUT・AC-API-009/010/011b)', () => {
	test('full キーで全体置換し、省略フィールドは初期化される', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1', occupation: '旧職業', bio: '旧自己紹介' });
		const result = await h.service.replaceMyProfile(fullKey('u1'), {
			firstName: 'Maria',
			lastName: 'Garcia'
		});
		expect(result.profile.firstName).toBe('Maria');
		expect(result.profile.occupation).toBeNull(); // 送らなかった項目は初期化
		expect(result.profile.bio).toBeNull();
		expect(result.profile.searchName).toBe('maria garcia');
	});

	test('read キーでの書き込みは Forbidden(AC-API-011b)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		await expect(
			h.service.replaceMyProfile(readKey('u1'), { firstName: 'A', lastName: 'B' })
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	test('自己紹介 501 文字は ValidationError(AC-API-009)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		await expect(
			h.service.replaceMyProfile(fullKey('u1'), {
				firstName: 'A',
				lastName: 'B',
				bio: 'あ'.repeat(501)
			})
		).rejects.toBeInstanceOf(ValidationError);
	});

	test('11 件目の SNS リンクは ValidationError(AC-API-009)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		const links = Array.from({ length: 11 }, () => ({
			platform: 'website',
			url: 'https://example.com'
		}));
		await expect(
			h.service.replaceMyProfile(fullKey('u1'), { firstName: 'A', lastName: 'B', snsLinks: links })
		).rejects.toBeInstanceOf(ValidationError);
	});

	test('visibility は省略時は現状維持(内容置換でも自動初期化しない)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1', visibility: Visibility.PRIVATE });
		const result = await h.service.replaceMyProfile(fullKey('u1'), {
			firstName: 'A',
			lastName: 'B'
		});
		expect(result.profile.visibility).toBe(Visibility.PRIVATE);
	});
});

describe('PublicProfileService.patchMyProfile(PATCH・AC-API-008)', () => {
	test('職業と SNS リンクのみ更新し他は維持する', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1', firstName: 'みなと', occupation: '旧' });
		const result = await h.service.patchMyProfile(fullKey('u1'), {
			occupation: 'イラストレーター',
			snsLinks: [{ platform: 'x', url: 'https://x.com/example' }]
		});
		expect(result.profile.occupation).toBe('イラストレーター');
		expect(result.profile.firstName).toBe('みなと'); // 未指定は維持
		expect(result.snsLinks).toHaveLength(1);
	});

	test('snsLinks 未指定なら既存のリンクを維持して返す', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		h.snsLinks.byProfile.set('p1', [
			{
				id: 'l1',
				profileId: 'p1',
				platform: 'github',
				url: 'https://github.com/x',
				label: null,
				sortOrder: 0,
				createdAt: new Date()
			}
		]);
		const result = await h.service.patchMyProfile(fullKey('u1'), { occupation: '職業' });
		expect(result.snsLinks).toHaveLength(1);
	});

	test('read キーでの書き込みは Forbidden(AC-API-011b)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		await expect(
			h.service.patchMyProfile(readKey('u1'), { occupation: 'x' })
		).rejects.toBeInstanceOf(ForbiddenError);
	});
});

describe('PublicProfileService.deleteMyProfile(DELETE・AC-API-010)', () => {
	test('内容を消去し非公開化する(アカウントは存続)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, {
			id: 'p1',
			userId: 'u1',
			firstName: 'みなと',
			lastName: '里中',
			occupation: '職業',
			bio: '自己紹介',
			visibility: Visibility.PUBLIC
		});
		h.snsLinks.byProfile.set('p1', [
			{
				id: 'l1',
				profileId: 'p1',
				platform: 'github',
				url: 'https://github.com/x',
				label: null,
				sortOrder: 0,
				createdAt: new Date()
			}
		]);
		const result = await h.service.deleteMyProfile(fullKey('u1'));
		expect(result.profile.firstName).toBe('');
		expect(result.profile.occupation).toBeNull();
		expect(result.profile.bio).toBeNull();
		expect(result.profile.visibility).toBe(Visibility.PRIVATE);
		expect(result.snsLinks).toEqual([]);
		// アカウント(users)は存続する。
		expect(h.users.users.get('u1')).toBeDefined();
	});

	test('read キーでの DELETE は Forbidden(AC-API-011b)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		await expect(h.service.deleteMyProfile(readKey('u1'))).rejects.toBeInstanceOf(ForbiddenError);
	});
});
