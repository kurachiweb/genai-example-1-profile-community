// 永続化層(MikroORM エンティティ・設定・Gateway 実装)の統合テスト。
// テスト用 SQLite(インメモリ)に対して実効公開フィルタ・カーソル・全置換を検証する(testing/01 §2.3)。
import { MikroORM } from '@mikro-orm/sqlite';
import { NameDisplayOrder } from '../src/domain/display-name';
import { Visibility } from '../src/domain/effective-public';
import { UserStatus } from '../src/domain/user-status';
import { buildMikroOrmConfig } from '../src/infrastructure/mikro-orm.config';
import { ProfileEntity } from '../src/infrastructure/persistence/entities/profile.entity';
import { UserEntity } from '../src/infrastructure/persistence/entities/user.entity';
import { MikroProfileRepository } from '../src/infrastructure/persistence/profile.repository';
import { MikroSnsLinkRepository } from '../src/infrastructure/persistence/sns-link.repository';
import { MikroUserRepository } from '../src/infrastructure/persistence/user.repository';
import type { ProfileCreateInput, UserCreateInput } from '../src/application/gateways';
import type { SnsLinkRecord } from '../src/application/models';

let orm: MikroORM;

beforeAll(async () => {
	orm = await MikroORM.init(buildMikroOrmConfig(':memory:'));
});

afterAll(async () => {
	await orm.close(true);
});

beforeEach(async () => {
	// MikroORM 7 は refreshDatabase → refresh(drop+create)。
	await orm.schema.refresh();
});

interface SeedOptions {
	status?: UserStatus;
	visibility?: Visibility;
	occupation?: string | null;
	updatedAt?: Date;
}

async function seed(id: string, handle: string, options: SeedOptions = {}): Promise<void> {
	const em = orm.em.fork();
	const user = em.create(UserEntity, {
		id: `user-${id}`,
		email: `${id}@example.com`,
		emailNormalized: `${id}@example.com`,
		passwordHash: 'x',
		status: options.status ?? UserStatus.ACTIVE
	});
	const updatedAt = options.updatedAt ?? new Date('2026-06-01T00:00:00.000Z');
	em.create(ProfileEntity, {
		id: `profile-${id}`,
		user,
		handle,
		visibility: options.visibility ?? Visibility.PUBLIC,
		firstName: 'みなと',
		lastName: '里中',
		nameDisplayOrder: NameDisplayOrder.GIVEN_FIRST,
		occupation: options.occupation ?? null,
		searchName: 'みなと 里中',
		createdAt: updatedAt,
		updatedAt
	});
	await em.flush();
}

describe('MikroProfileRepository', () => {
	test('findByHandle はハンドルでプロフィールを引ける', async () => {
		await seed('a', 'minato');
		const repo = new MikroProfileRepository(orm.em);
		const profile = await repo.findByHandle('minato');
		expect(profile?.id).toBe('profile-a');
		expect(profile?.userId).toBe('user-a');
	});

	test('listEffectivePublic は非公開・未確認を SQL 段階で除外する', async () => {
		await seed('a', 'a-handle', { updatedAt: new Date('2026-06-03T00:00:00.000Z') });
		await seed('b', 'b-handle', { status: UserStatus.UNVERIFIED });
		await seed('c', 'c-handle', { visibility: Visibility.PRIVATE });
		const repo = new MikroProfileRepository(orm.em);
		const rows = await repo.listEffectivePublic({ limit: 20 });
		expect(rows.map((r) => r.id)).toEqual(['profile-a']);
	});

	test('listEffectivePublic は updated_at 降順で並びカーソルで続きを取得する', async () => {
		await seed('a', 'a-handle', { updatedAt: new Date('2026-06-01T00:00:00.000Z') });
		await seed('b', 'b-handle', { updatedAt: new Date('2026-06-02T00:00:00.000Z') });
		await seed('c', 'c-handle', { updatedAt: new Date('2026-06-03T00:00:00.000Z') });
		const repo = new MikroProfileRepository(orm.em);

		const firstPage = await repo.listEffectivePublic({ limit: 2 });
		expect(firstPage.map((r) => r.id)).toEqual(['profile-c', 'profile-b']);

		const last = firstPage[firstPage.length - 1];
		const nextPage = await repo.listEffectivePublic({
			limit: 2,
			cursor: { updatedAt: last.updatedAt.toISOString(), id: last.id }
		});
		expect(nextPage.map((r) => r.id)).toEqual(['profile-a']);
	});

	test('listEffectivePublic は職業で中間一致検索する', async () => {
		await seed('a', 'a-handle', { occupation: 'イラストレーター' });
		await seed('b', 'b-handle', { occupation: 'エンジニア' });
		const repo = new MikroProfileRepository(orm.em);
		const rows = await repo.listEffectivePublic({ limit: 20, search: 'イラスト' });
		expect(rows.map((r) => r.id)).toEqual(['profile-a']);
	});

	test('save は既存プロフィールのハンドルを更新する', async () => {
		await seed('a', 'old-handle');
		const repo = new MikroProfileRepository(orm.em);
		const current = await repo.findByHandle('old-handle');
		await repo.save({
			...current!,
			handle: 'new-handle',
			updatedAt: new Date('2026-06-10T00:00:00.000Z')
		});
		expect(await repo.findByHandle('old-handle')).toBeNull();
		expect((await repo.findByHandle('new-handle'))?.id).toBe('profile-a');
	});
});

describe('MikroUserRepository', () => {
	test('findById は状態を返す', async () => {
		await seed('a', 'a-handle', { status: UserStatus.FROZEN });
		const repo = new MikroUserRepository(orm.em);
		expect(await repo.findById('user-a')).toEqual({
			id: 'user-a',
			email: 'a@example.com',
			status: UserStatus.FROZEN,
			emailVerifiedAt: null
		});
	});

	describe('createWithProfile', () => {
		function userInput(overrides: Partial<UserCreateInput> = {}): UserCreateInput {
			return {
				id: 'user-new',
				email: 'new@example.com',
				emailNormalized: 'new@example.com',
				passwordHash: 'hashed:password1234',
				status: UserStatus.UNVERIFIED,
				...overrides
			};
		}

		function profileInput(overrides: Partial<ProfileCreateInput> = {}): ProfileCreateInput {
			return {
				id: 'profile-new',
				userId: 'user-new',
				handle: 'new-handle',
				...overrides
			};
		}

		test('ユーザーとプロフィールを同時に作成する', async () => {
			const repo = new MikroUserRepository(orm.em);
			await repo.createWithProfile(userInput(), profileInput());

			const user = await repo.findById('user-new');
			expect(user).toEqual({
				id: 'user-new',
				email: 'new@example.com',
				status: UserStatus.UNVERIFIED,
				emailVerifiedAt: null
			});

			const profileRepo = new MikroProfileRepository(orm.em);
			const profile = await profileRepo.findByUserId('user-new');
			expect(profile?.id).toBe('profile-new');
			expect(profile?.handle).toBe('new-handle');
		});

		test('作成直後はメール未確認(emailVerifiedAt=null)である', async () => {
			const repo = new MikroUserRepository(orm.em);
			await repo.createWithProfile(userInput(), profileInput());
			expect((await repo.findById('user-new'))?.emailVerifiedAt).toBeNull();
		});

		test('パスワードハッシュを保存し、認証用に取得できる(ユーザーレコードには含めない)', async () => {
			const repo = new MikroUserRepository(orm.em);
			await repo.createWithProfile(userInput({ passwordHash: 'hashed:secret' }), profileInput());
			expect(await repo.getPasswordHash('user-new')).toBe('hashed:secret');
		});

		test('プロフィールは公開・氏名表示順=given_first の既定値で作成される(BR-COMMON-006)', async () => {
			const repo = new MikroUserRepository(orm.em);
			await repo.createWithProfile(userInput(), profileInput());

			const profileRepo = new MikroProfileRepository(orm.em);
			const profile = await profileRepo.findByUserId('user-new');
			expect(profile?.visibility).toBe(Visibility.PUBLIC);
			expect(profile?.nameDisplayOrder).toBe(NameDisplayOrder.GIVEN_FIRST);
			expect(profile?.firstName).toBe('');
			expect(profile?.lastName).toBe('');
			expect(profile?.iconImageId).toBeNull();
			expect(profile?.occupation).toBeNull();
			expect(profile?.bio).toBeNull();
		});

		test('emailNormalized が重複する場合は一意制約違反で失敗し、プロフィールも作成されない', async () => {
			await seed('a', 'a-handle');
			const repo = new MikroUserRepository(orm.em);
			await expect(
				repo.createWithProfile(
					userInput({ id: 'user-dup', emailNormalized: 'a@example.com' }),
					profileInput({ id: 'profile-dup', userId: 'user-dup', handle: 'dup-handle' })
				)
			).rejects.toThrow();

			expect(await repo.findById('user-dup')).toBeNull();
			const profileRepo = new MikroProfileRepository(orm.em);
			expect(await profileRepo.findByHandle('dup-handle')).toBeNull();
		});

		test('handle が重複する場合は一意制約違反で失敗し、ユーザーも作成されない', async () => {
			await seed('a', 'a-handle');
			const repo = new MikroUserRepository(orm.em);
			await expect(
				repo.createWithProfile(
					userInput({ id: 'user-dup2', emailNormalized: 'dup2@example.com' }),
					profileInput({ id: 'profile-dup2', userId: 'user-dup2', handle: 'a-handle' })
				)
			).rejects.toThrow();

			expect(await repo.findById('user-dup2')).toBeNull();
		});
	});
});

describe('MikroSnsLinkRepository', () => {
	function link(id: string, profileId: string, sortOrder: number): SnsLinkRecord {
		return {
			id,
			profileId,
			platform: 'github',
			url: `https://github.com/${id}`,
			label: null,
			sortOrder,
			createdAt: new Date('2026-06-01T00:00:00.000Z')
		};
	}

	test('replaceForProfile が全置換し findByProfileIds が sortOrder 昇順で返す', async () => {
		await seed('a', 'a-handle');
		const repo = new MikroSnsLinkRepository(orm.em);
		await repo.replaceForProfile('profile-a', [
			link('l1', 'profile-a', 0),
			link('l2', 'profile-a', 1)
		]);
		// 置換: 既存を消して 1 件に。
		await repo.replaceForProfile('profile-a', [link('l3', 'profile-a', 0)]);
		const rows = await repo.findByProfileIds(['profile-a']);
		expect(rows.map((r) => r.id)).toEqual(['l3']);
	});

	test('findByProfileIds は複数プロフィールをまとめて取得する(DataLoader バッチ)', async () => {
		await seed('a', 'a-handle');
		await seed('b', 'b-handle');
		const repo = new MikroSnsLinkRepository(orm.em);
		await repo.replaceForProfile('profile-a', [link('la', 'profile-a', 0)]);
		await repo.replaceForProfile('profile-b', [link('lb', 'profile-b', 0)]);
		const rows = await repo.findByProfileIds(['profile-a', 'profile-b']);
		expect(rows.map((r) => r.id).sort()).toEqual(['la', 'lb']);
	});

	test('空配列の問い合わせは即座に空を返す', async () => {
		const repo = new MikroSnsLinkRepository(orm.em);
		expect(await repo.findByProfileIds([])).toEqual([]);
	});
});
