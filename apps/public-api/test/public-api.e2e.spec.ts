// 公開 REST API の統合テスト(Nest Testing + インメモリ SQLite + Supertest)。
// 認証・スコープ・実効公開ゲート・共通エンベロープ・エラー写像・レート制限を HTTP レベルで検証する
// (testing/01 §2.2)。受け入れ条件の正本は features/05-public-api.md §6(AC-API-*)。
import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { NameDisplayOrder } from '../src/domain/display-name';
import { Visibility } from '../src/domain/effective-public';
import { UserStatus } from '../src/domain/user-status';
import { ApiKeyScope, ApiKeyStatus } from '../src/domain/api-key';
import { AppModule } from '../src/app.module';
import { hashApiKey } from '../src/infrastructure/hashing';
import { ApiKeyEntity } from '../src/infrastructure/persistence/entities/api-key.entity';
import { ProfileEntity } from '../src/infrastructure/persistence/entities/profile.entity';
import { UserEntity } from '../src/infrastructure/persistence/entities/user.entity';
import { buildValidationPipe } from '../src/interface/rest/validation';

const BASE = '/api/public/v1';
const FULL_KEY = 'gpc_full_test_key';
const READ_KEY = 'gpc_read_test_key';

interface SeedOptions {
	status?: UserStatus;
	visibility?: Visibility;
	scope?: ApiKeyScope;
	rawKey?: string;
	keyStatus?: ApiKeyStatus;
	occupation?: string | null;
}

async function buildApp(
	rateLimitPerWindow = 1000
): Promise<{ app: INestApplication; orm: MikroORM }> {
	process.env.DATABASE_URL = ':memory:';
	process.env.NODE_ENV = 'test';
	process.env.RATE_LIMIT_PER_WINDOW = String(rateLimitPerWindow);
	process.env.RATE_LIMIT_WINDOW_SECONDS = '60';
	const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
	const app = moduleRef.createNestApplication();
	app.setGlobalPrefix('api/public/v1');
	app.useGlobalPipes(buildValidationPipe());
	await app.init();
	// 明示注釈で MikroORM 型へ widen(app.get の戻りは entities が readonly 変種のため)。
	const orm: MikroORM = app.get(MikroORM);
	await orm.schema.create();
	return { app, orm };
}

async function seed(
	orm: MikroORM,
	id: string,
	handle: string,
	options: SeedOptions = {}
): Promise<void> {
	const em = orm.em.fork();
	const status = options.status ?? UserStatus.ACTIVE;
	const user = em.create(UserEntity, {
		id: `user-${id}`,
		email: `${id}@example.com`,
		emailNormalized: `${id}@example.com`,
		passwordHash: 'x',
		status,
		emailVerifiedAt: status === UserStatus.ACTIVE ? new Date('2026-06-01T00:00:00.000Z') : null
	});
	em.create(ProfileEntity, {
		id: `profile-${id}`,
		user,
		handle,
		visibility: options.visibility ?? Visibility.PUBLIC,
		firstName: 'みなと',
		lastName: '里中',
		nameDisplayOrder: NameDisplayOrder.GIVEN_FIRST,
		occupation: options.occupation ?? null,
		searchName: 'みなと 里中'
	});
	if (options.rawKey) {
		em.create(ApiKeyEntity, {
			id: `key-${id}`,
			user,
			keyHash: hashApiKey(options.rawKey),
			scope: options.scope ?? ApiKeyScope.FULL,
			status: options.keyStatus ?? ApiKeyStatus.ACTIVE
		});
	}
	await em.flush();
}

describe('公開 REST API', () => {
	let app: INestApplication;
	let orm: MikroORM;

	beforeAll(async () => {
		({ app, orm } = await buildApp());
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await orm.schema.refresh();
	});

	const auth = (key: string) => ({ Authorization: `Bearer ${key}` });

	describe('認証(BR-API-001 / AC-API-004)', () => {
		test('キー無しは 401 UNAUTHORIZED(共通エンベロープ)', async () => {
			const res = await request(app.getHttpServer()).get(`${BASE}/me/profile`);
			expect(res.status).toBe(401);
			expect(res.body).toMatchObject({ success: false, data: null });
			expect(res.body.error.code).toBe('UNAUTHORIZED');
		});

		test('失効キーは 401(AC-API-004)', async () => {
			await seed(orm, 'a', 'minato', {
				rawKey: FULL_KEY,
				keyStatus: ApiKeyStatus.REVOKED
			});
			const res = await request(app.getHttpServer()).get(`${BASE}/me/profile`).set(auth(FULL_KEY));
			expect(res.status).toBe(401);
			expect(res.body.error.code).toBe('UNAUTHORIZED');
		});

		test('凍結ユーザーのキーは 401(BR-COMMON-005)', async () => {
			await seed(orm, 'a', 'minato', { status: UserStatus.FROZEN, rawKey: FULL_KEY });
			const res = await request(app.getHttpServer()).get(`${BASE}/me/profile`).set(auth(FULL_KEY));
			expect(res.status).toBe(401);
		});
	});

	describe('Read(AC-API-005/006/007)', () => {
		test('read キーで自分の非公開プロフィールを取得(AC-API-005)', async () => {
			await seed(orm, 'a', 'minato', {
				visibility: Visibility.PRIVATE,
				scope: ApiKeyScope.READ,
				rawKey: READ_KEY
			});
			const res = await request(app.getHttpServer()).get(`${BASE}/me/profile`).set(auth(READ_KEY));
			expect(res.status).toBe(200);
			expect(res.body).toMatchObject({ success: true, error: null });
			expect(res.body.data).toMatchObject({ handle: 'minato', visibility: 'private' });
		});

		test('他者の公開プロフィールを取得し非公開属性を含まない(AC-API-006)', async () => {
			await seed(orm, 'a', 'me', { scope: ApiKeyScope.READ, rawKey: READ_KEY });
			await seed(orm, 'b', 'taro');
			const res = await request(app.getHttpServer())
				.get(`${BASE}/profiles/taro`)
				.set(auth(READ_KEY));
			expect(res.status).toBe(200);
			expect(res.body.data.handle).toBe('taro');
			expect(res.body.data.displayName).toBe('みなと 里中');
			// 内部 ID やメール等の非公開属性は含めない。
			expect(res.body.data).not.toHaveProperty('id');
			expect(res.body.data).not.toHaveProperty('userId');
			expect(res.body.data).not.toHaveProperty('email');
		});

		test('非公開ユーザーは 404 で秘匿(AC-API-007)', async () => {
			await seed(orm, 'a', 'me', { rawKey: FULL_KEY });
			await seed(orm, 'b', 'hidden', { visibility: Visibility.PRIVATE });
			const res = await request(app.getHttpServer())
				.get(`${BASE}/profiles/hidden`)
				.set(auth(FULL_KEY));
			expect(res.status).toBe(404);
			expect(res.body.error.code).toBe('NOT_FOUND');
		});

		test('一覧は実効公開のみ・meta にページング情報(BR-API-007)', async () => {
			await seed(orm, 'a', 'me', { rawKey: FULL_KEY });
			await seed(orm, 'b', 'taro');
			await seed(orm, 'c', 'hidden', { visibility: Visibility.PRIVATE });
			const res = await request(app.getHttpServer())
				.get(`${BASE}/profiles?limit=10`)
				.set(auth(FULL_KEY));
			expect(res.status).toBe(200);
			const handles = (res.body.data as { handle: string }[]).map((p) => p.handle).sort();
			expect(handles).toEqual(['me', 'taro']);
			expect(res.body.meta).toMatchObject({ hasMore: false });
			expect(res.body.meta).toHaveProperty('nextCursor');
		});
	});

	describe('Create/Update/Delete(AC-API-008/009/010/011b)', () => {
		test('PATCH で職業と SNS リンクを更新(AC-API-008)', async () => {
			await seed(orm, 'a', 'minato', { rawKey: FULL_KEY });
			const res = await request(app.getHttpServer())
				.patch(`${BASE}/me/profile`)
				.set(auth(FULL_KEY))
				.send({
					occupation: 'イラストレーター',
					snsLinks: [{ platform: 'github', url: 'https://github.com/example' }]
				});
			expect(res.status).toBe(200);
			expect(res.body.data.occupation).toBe('イラストレーター');
			expect(res.body.data.snsLinks).toHaveLength(1);
		});

		test('PUT で 501 文字の自己紹介は 422 + details(AC-API-009)', async () => {
			await seed(orm, 'a', 'minato', { rawKey: FULL_KEY });
			const res = await request(app.getHttpServer())
				.put(`${BASE}/me/profile`)
				.set(auth(FULL_KEY))
				.send({ firstName: 'A', lastName: 'B', bio: 'あ'.repeat(501) });
			expect(res.status).toBe(422);
			expect(res.body.error.code).toBe('VALIDATION_ERROR');
			expect(Array.isArray(res.body.error.details)).toBe(true);
			expect(res.body.error.details.some((d: { field: string }) => d.field === 'bio')).toBe(true);
		});

		test('DELETE は内容消去＋非公開化、アカウントは存続(AC-API-010)', async () => {
			await seed(orm, 'a', 'minato', {
				rawKey: FULL_KEY,
				occupation: '職業',
				visibility: Visibility.PUBLIC
			});
			const res = await request(app.getHttpServer())
				.delete(`${BASE}/me/profile`)
				.set(auth(FULL_KEY));
			expect(res.status).toBe(200);
			expect(res.body.data.occupation).toBeNull();
			expect(res.body.data.visibility).toBe('private');
			// アカウントは存続し、再取得できる(ログイン継続相当)。
			const after = await request(app.getHttpServer())
				.get(`${BASE}/me/profile`)
				.set(auth(FULL_KEY));
			expect(after.status).toBe(200);
		});

		test('read キーでの書き込みは 403(AC-API-011b)', async () => {
			await seed(orm, 'a', 'minato', { scope: ApiKeyScope.READ, rawKey: READ_KEY });
			const put = await request(app.getHttpServer())
				.put(`${BASE}/me/profile`)
				.set(auth(READ_KEY))
				.send({ firstName: 'A', lastName: 'B' });
			expect(put.status).toBe(403);
			expect(put.body.error.code).toBe('FORBIDDEN');

			const del = await request(app.getHttpServer())
				.delete(`${BASE}/me/profile`)
				.set(auth(READ_KEY));
			expect(del.status).toBe(403);
		});
	});

	describe('操作制限(AC-API-012)', () => {
		test('アカウント退会など未定義エンドポイントは 404', async () => {
			const res = await request(app.getHttpServer()).delete(`${BASE}/me`).set(auth(FULL_KEY));
			expect(res.status).toBe(404);
			expect(res.body.success).toBe(false);
		});
	});

	describe('レート制限ヘッダ(AC-API-013)', () => {
		test('応答に RateLimit-Limit/Remaining/Reset が付く', async () => {
			await seed(orm, 'a', 'minato', { rawKey: FULL_KEY });
			const res = await request(app.getHttpServer()).get(`${BASE}/me/profile`).set(auth(FULL_KEY));
			expect(res.headers).toHaveProperty('ratelimit-limit');
			expect(res.headers).toHaveProperty('ratelimit-remaining');
			expect(res.headers).toHaveProperty('ratelimit-reset');
		});
	});
});

describe('レート制限超過(AC-API-014)', () => {
	let app: INestApplication;
	let orm: MikroORM;

	beforeAll(async () => {
		// しきい値 2 の専用アプリで超過挙動を検証する。
		({ app, orm } = await buildApp(2));
		await orm.schema.refresh();
		await seed(orm, 'a', 'minato', { rawKey: FULL_KEY });
	});

	afterAll(async () => {
		await app.close();
	});

	test('上限超過で 429 RATE_LIMITED + Retry-After', async () => {
		const server = app.getHttpServer();
		const ok1 = await request(server)
			.get(`${BASE}/me/profile`)
			.set({ Authorization: `Bearer ${FULL_KEY}` });
		const ok2 = await request(server)
			.get(`${BASE}/me/profile`)
			.set({ Authorization: `Bearer ${FULL_KEY}` });
		const blocked = await request(server)
			.get(`${BASE}/me/profile`)
			.set({ Authorization: `Bearer ${FULL_KEY}` });
		expect(ok1.status).toBe(200);
		expect(ok2.status).toBe(200);
		expect(blocked.status).toBe(429);
		expect(blocked.body.error.code).toBe('RATE_LIMITED');
		expect(blocked.headers).toHaveProperty('retry-after');
	});
});
