import { ProfileCursor } from '../domain/cursor';
import { NameDisplayOrder } from '../domain/display-name';
import { Visibility } from '../domain/effective-public';
import {
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
	ValidationError
} from '../domain/errors';
import { UserStatus } from '../domain/user-status';
import {
	Clock,
	IdGenerator,
	ProfileListFilter,
	ProfileRepository,
	SnsLinkRepository,
	UserRepository
} from './gateways';
import { ProfileRecord, SnsLinkRecord, UserRecord, Viewer } from './models';
import { ProfileService } from './profile.service';

// --- テスト用フェイク(Gateway 境界で差し替え。決定論的、testing/01 §3) ---

class FakeUserRepository implements UserRepository {
	readonly users = new Map<string, UserRecord>();
	async findById(id: string): Promise<UserRecord | null> {
		return this.users.get(id) ?? null;
	}
	async findByEmailNormalized(): Promise<UserRecord | null> {
		return null;
	}
	async createWithProfile(): Promise<void> {}
	async getPasswordHash(): Promise<string | null> {
		return null;
	}
	async update(): Promise<void> {}
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
		if (filter.search) {
			const q = filter.search.toLowerCase();
			rows = rows.filter(
				(p) =>
					(p.searchName ?? '').includes(q) ||
					(p.occupation ?? '').toLowerCase().includes(q) ||
					(p.bio ?? '').toLowerCase().includes(q)
			);
		}
		// (updated_at desc, id desc) の安定ソート。
		rows.sort((a, b) => {
			const t = b.updatedAt.getTime() - a.updatedAt.getTime();
			return t !== 0 ? t : b.id.localeCompare(a.id);
		});
		if (filter.cursor) {
			rows = rows.filter((p) => isAfterCursor(p, filter.cursor!));
		}
		return rows.slice(0, filter.limit);
	}
	async listEffectivePublicOffset(filter: {
		search?: string;
		limit: number;
		offset: number;
	}): Promise<{ profiles: ProfileRecord[]; total: number }> {
		let rows = [...this.profiles.values()].filter((p) => {
			const owner = this.users.users.get(p.userId);
			return p.visibility === Visibility.PUBLIC && owner?.status === UserStatus.ACTIVE;
		});
		if (filter.search) {
			const q = filter.search.toLowerCase();
			rows = rows.filter(
				(p) =>
					(p.searchName ?? '').includes(q) ||
					(p.occupation ?? '').toLowerCase().includes(q) ||
					(p.bio ?? '').toLowerCase().includes(q)
			);
		}
		rows.sort((a, b) => {
			const t = b.updatedAt.getTime() - a.updatedAt.getTime();
			return t !== 0 ? t : b.id.localeCompare(a.id);
		});
		const total = rows.length;
		return { profiles: rows.slice(filter.offset, filter.offset + filter.limit), total };
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
	service: ProfileService;
	users: FakeUserRepository;
	profiles: FakeProfileRepository;
	snsLinks: FakeSnsLinkRepository;
	clock: FixedClock;
}

function makeHarness(): Harness {
	const users = new FakeUserRepository();
	const profiles = new FakeProfileRepository(users);
	const snsLinks = new FakeSnsLinkRepository();
	const clock = new FixedClock(new Date('2026-06-15T00:00:00.000Z'));
	const service = new ProfileService({
		users,
		profiles,
		snsLinks,
		clock,
		ids: new SeqIdGenerator()
	});
	return { service, users, profiles, snsLinks, clock };
}

function seedUser(h: Harness, id: string, status: UserStatus): void {
	h.users.users.set(id, { id, email: `${id}@example.com`, status, emailVerifiedAt: null });
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

const activeViewer = (userId: string): Viewer => ({ userId, status: UserStatus.ACTIVE });

describe('ProfileService.getPublicProfileByHandle(実効公開ゲート)', () => {
	test('実効公開のプロフィールを返す(AC-SHARE-007)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1', handle: 'minato' });
		await expect(h.service.getPublicProfileByHandle('minato')).resolves.toMatchObject({ id: 'p1' });
	});

	test('存在しないハンドルは NotFound', async () => {
		const h = makeHarness();
		await expect(h.service.getPublicProfileByHandle('none')).rejects.toBeInstanceOf(NotFoundError);
	});

	test('所有者が UNVERIFIED のとき第三者には NotFound で秘匿(AC-SHARE-008)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.UNVERIFIED);
		seedProfile(h, { id: 'p1', userId: 'u1', handle: 'minato' });
		await expect(h.service.getPublicProfileByHandle('minato')).rejects.toBeInstanceOf(
			NotFoundError
		);
	});

	test('private のとき第三者には NotFound(AC-SHARE-009)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1', handle: 'minato', visibility: Visibility.PRIVATE });
		await expect(h.service.getPublicProfileByHandle('minato')).rejects.toBeInstanceOf(
			NotFoundError
		);
	});

	test('所有者が FROZEN のとき NotFound(AC-SHARE-010)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.FROZEN);
		seedProfile(h, { id: 'p1', userId: 'u1', handle: 'minato' });
		await expect(h.service.getPublicProfileByHandle('minato')).rejects.toBeInstanceOf(
			NotFoundError
		);
	});
});

describe('ProfileService.getMyProfile(本人取得)', () => {
	test('非公開でも本人は取得できる(AC-API-005)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1', visibility: Visibility.PRIVATE });
		await expect(h.service.getMyProfile(activeViewer('u1'))).resolves.toMatchObject({ id: 'p1' });
	});

	test('未ログインは Unauthorized', async () => {
		const h = makeHarness();
		await expect(h.service.getMyProfile(null)).rejects.toBeInstanceOf(UnauthorizedError);
	});
});

describe('ProfileService.listPublicProfiles(カーソル接続)', () => {
	test('実効公開のみを返し非公開/未確認を除外する', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedUser(h, 'u2', UserStatus.UNVERIFIED);
		seedUser(h, 'u3', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		seedProfile(h, { id: 'p2', userId: 'u2' }); // 未確認 → 除外
		seedProfile(h, { id: 'p3', userId: 'u3', visibility: Visibility.PRIVATE }); // 非公開 → 除外
		const result = await h.service.listPublicProfiles({});
		expect(result.edges.map((e) => e.node.id)).toEqual(['p1']);
	});

	test('first を超える件があるとき hasNextPage=true・endCursor で続きを取得できる', async () => {
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
		expect(first.edges).toHaveLength(2);
		expect(first.hasNextPage).toBe(true);
		expect(first.edges[0].node.id).toBe('p3'); // 新着順(updated_at desc)

		const second = await h.service.listPublicProfiles({ first: 2, after: first.endCursor! });
		expect(second.edges.map((e) => e.node.id)).toEqual(['p1']);
		expect(second.hasNextPage).toBe(false);
	});

	test('検索語で職業に中間一致する', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedUser(h, 'u2', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1', occupation: 'イラストレーター' });
		seedProfile(h, { id: 'p2', userId: 'u2', occupation: 'エンジニア' });
		const result = await h.service.listPublicProfiles({ search: 'イラスト' });
		expect(result.edges.map((e) => e.node.id)).toEqual(['p1']);
	});
});

describe('ProfileService.updateProfileContent(検証・正規化)', () => {
	test('氏名を空で更新すると ValidationError(AC-PROF-008)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		await expect(
			h.service.updateProfileContent(activeViewer('u1'), { firstName: '  ' })
		).rejects.toBeInstanceOf(ValidationError);
	});

	test('自己紹介 501 文字は ValidationError、500 文字は許可(AC-PROF-011)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		await expect(
			h.service.updateProfileContent(activeViewer('u1'), { bio: 'あ'.repeat(501) })
		).rejects.toBeInstanceOf(ValidationError);
		await expect(
			h.service.updateProfileContent(activeViewer('u1'), { bio: 'あ'.repeat(500) })
		).resolves.toMatchObject({ bio: 'あ'.repeat(500) });
	});

	test('正常更新で検索名を再導出し updatedAt を更新する', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		h.clock.set(new Date('2026-06-20T00:00:00.000Z'));
		const updated = await h.service.updateProfileContent(activeViewer('u1'), {
			firstName: 'Maria',
			lastName: 'Garcia',
			nameDisplayOrder: NameDisplayOrder.GIVEN_FIRST
		});
		expect(updated.searchName).toBe('maria garcia');
		expect(updated.updatedAt.toISOString()).toBe('2026-06-20T00:00:00.000Z');
	});

	test('FROZEN は編集不可で Forbidden(BR-COMMON-005)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.FROZEN);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		await expect(
			h.service.updateProfileContent(
				{ userId: 'u1', status: UserStatus.FROZEN },
				{ firstName: 'A' }
			)
		).rejects.toBeInstanceOf(ForbiddenError);
	});
});

describe('ProfileService.changeHandle', () => {
	test('予約語は ValidationError(AC-SHARE-004)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		await expect(h.service.changeHandle(activeViewer('u1'), 'admin')).rejects.toBeInstanceOf(
			ValidationError
		);
	});

	test('既存ハンドルとの重複は ValidationError(AC-SHARE-003)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedUser(h, 'u2', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1', handle: 'taken' });
		seedProfile(h, { id: 'p2', userId: 'u2', handle: 'mine' });
		await expect(h.service.changeHandle(activeViewer('u2'), 'taken')).rejects.toBeInstanceOf(
			ValidationError
		);
	});

	test('正当なハンドルへ変更できる(AC-SHARE-001)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		const updated = await h.service.changeHandle(activeViewer('u1'), 'minato-satonaka');
		expect(updated.handle).toBe('minato-satonaka');
	});
});

describe('ProfileService.replaceSnsLinks', () => {
	test('11 件目は ValidationError(AC-PROF-015)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		const links = Array.from({ length: 11 }, () => ({
			platform: 'website',
			url: 'https://example.com'
		}));
		await expect(h.service.replaceSnsLinks(activeViewer('u1'), links)).rejects.toBeInstanceOf(
			ValidationError
		);
	});

	test('非 https は ValidationError(AC-PROF-014)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		await expect(
			h.service.replaceSnsLinks(activeViewer('u1'), [
				{ platform: 'github', url: 'http://github.com/x' }
			])
		).rejects.toBeInstanceOf(ValidationError);
	});

	test('正常設定で入力順を sortOrder として確定する(AC-PROF-016)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1' });
		const result = await h.service.replaceSnsLinks(activeViewer('u1'), [
			{ platform: 'github', url: 'https://github.com/example' },
			{ platform: 'x', url: 'https://x.com/example' }
		]);
		expect(result.map((r) => r.sortOrder)).toEqual([0, 1]);
		expect(result[0].profileId).toBe('p1');
	});
});

describe('ProfileService.updateVisibility', () => {
	test('public から private へ切り替える(AC-SHARE-009)', async () => {
		const h = makeHarness();
		seedUser(h, 'u1', UserStatus.ACTIVE);
		seedProfile(h, { id: 'p1', userId: 'u1', visibility: Visibility.PUBLIC });
		const updated = await h.service.updateVisibility(activeViewer('u1'), Visibility.PRIVATE);
		expect(updated.visibility).toBe(Visibility.PRIVATE);
	});
});
