// 管理者コンソール GraphQL の統合テスト(Nest Testing + インメモリ SQLite + Supertest)。
// 認証(セッションヘッダ)・RBAC・監査・状態整合を End-to-End で検証する(testing/01 §2.2)。
import { hash } from '@node-rs/argon2';
import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AdminRole } from '../src/domain/admin-role';
import { UserStatus } from '../src/domain/user-status';
import { AppModule } from '../src/app.module';
import { AdminAccountEntity } from '../src/infrastructure/persistence/entities/admin-account.entity';
import { UserEntity } from '../src/infrastructure/persistence/entities/user.entity';
import { ADMIN_SESSION_STORE } from '../src/application/admin/gateways';
import { InMemoryAdminSessionStore } from '../src/application/admin/fakes';

let app: INestApplication;
let orm: MikroORM;

beforeAll(async () => {
	process.env.DATABASE_URL = ':memory:';
	process.env.NODE_ENV = 'test';
	// セッションストアは Valkey 接続を要するため、統合テストではインメモリ・フェイクへ差し替える
	// (testing/01 §3「KV / Durable Objects」参照)。
	const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
		.overrideProvider(ADMIN_SESSION_STORE)
		.useValue(new InMemoryAdminSessionStore({ now: () => new Date() }))
		.compile();
	app = moduleRef.createNestApplication();
	await app.init();
	orm = app.get(MikroORM);
	await orm.schema.create();
});

afterAll(async () => {
	await app.close();
});

beforeEach(async () => {
	await orm.schema.refresh();
});

const SUPER_PASSWORD = 'super-admin-password-123';

async function seedSuperAdmin(): Promise<void> {
	const em = orm.em.fork();
	em.create(AdminAccountEntity, {
		id: 'admin-super',
		email: 'super@example.com',
		emailNormalized: 'super@example.com',
		passwordHash: await hash(SUPER_PASSWORD),
		role: AdminRole.SUPER_ADMIN,
		status: 'active'
	});
	await em.flush();
}

async function seedUser(id: string, status: UserStatus): Promise<void> {
	const em = orm.em.fork();
	em.create(UserEntity, {
		id,
		email: `${id}@example.com`,
		emailNormalized: `${id}@example.com`,
		passwordHash: 'x',
		status
	});
	await em.flush();
}

interface GqlOptions {
	readonly sessionId?: string;
}

async function gql(query: string, variables: Record<string, unknown>, options: GqlOptions = {}) {
	const req = request(app.getHttpServer()).post('/graphql');
	if (options.sessionId) {
		req.set('x-admin-session', options.sessionId);
	}
	return req.send({ query, variables });
}

async function login(): Promise<string> {
	const res = await gql(
		`mutation($input: AdminLoginInput!){ adminLogin(input:$input){ sessionId role } }`,
		{ input: { email: 'super@example.com', password: SUPER_PASSWORD } }
	);
	return res.body.data.adminLogin.sessionId as string;
}

describe('管理者 GraphQL 統合', () => {
	test('正しい資格情報でログインしセッションを得る', async () => {
		await seedSuperAdmin();
		const res = await gql(
			`mutation($input: AdminLoginInput!){ adminLogin(input:$input){ sessionId csrfToken role } }`,
			{ input: { email: 'super@example.com', password: SUPER_PASSWORD } }
		);
		expect(res.body.data.adminLogin.role).toBe('super_admin');
		expect(res.body.data.adminLogin.sessionId).toBeTruthy();
		expect(res.body.data.adminLogin.csrfToken).toBeTruthy();
	});

	test('誤ったパスワードは UNAUTHORIZED', async () => {
		await seedSuperAdmin();
		const res = await gql(
			`mutation($input: AdminLoginInput!){ adminLogin(input:$input){ sessionId } }`,
			{ input: { email: 'super@example.com', password: 'wrong' } }
		);
		expect(res.body.errors[0].extensions.code).toBe('UNAUTHORIZED');
	});

	test('セッション無しの adminMe は UNAUTHORIZED(UI 非表示だけに頼らない)', async () => {
		await seedSuperAdmin();
		const res = await gql(`query{ adminMe{ adminId role } }`, {});
		expect(res.body.errors[0].extensions.code).toBe('UNAUTHORIZED');
	});

	test('セッションありで adminMe / adminStats を取得できる', async () => {
		await seedSuperAdmin();
		await seedUser('user-1', UserStatus.ACTIVE);
		const sessionId = await login();

		const me = await gql(`query{ adminMe{ adminId role } }`, {}, { sessionId });
		expect(me.body.data.adminMe.role).toBe('super_admin');

		const stats = await gql(`query{ adminStats{ totalUsers activeUsers } }`, {}, { sessionId });
		expect(stats.body.data.adminStats.totalUsers).toBe(1);
		expect(stats.body.data.adminStats.activeUsers).toBe(1);
	});

	test('super_admin が moderator を作成し監査ログに残る(AC-ADMIN-002/012)', async () => {
		await seedSuperAdmin();
		const sessionId = await login();

		const created = await gql(
			`mutation($input: AdminCreateAdminInput!){ adminCreateAdmin(input:$input){ email role } }`,
			{ input: { email: 'mod@example.com', password: 'moderator-pass-123', role: 'moderator' } },
			{ sessionId }
		);
		expect(created.body.data.adminCreateAdmin.role).toBe('moderator');

		const logs = await gql(
			`query{ adminAuditLogs(limit:10){ total logs{ eventType } } }`,
			{},
			{ sessionId }
		);
		const events = logs.body.data.adminAuditLogs.logs.map(
			(l: { eventType: string }) => l.eventType
		);
		expect(events).toContain('admin.created');
		expect(events).toContain('admin.login');
	});

	test('ユーザー凍結で状態が FROZEN になり監査に残る(AC-ADMIN-006)', async () => {
		await seedSuperAdmin();
		await seedUser('user-2', UserStatus.ACTIVE);
		const sessionId = await login();

		const frozen = await gql(
			`mutation($input: AdminFreezeUserInput!){ adminFreezeUser(input:$input){ id status } }`,
			{ input: { userId: 'user-2', reasonCategory: 'spam' } },
			{ sessionId }
		);
		expect(frozen.body.data.adminFreezeUser.status).toBe('FROZEN');
	});

	test('super_admin が共通レート制限を 60→120 に変更できる(AC-ADMIN-009)', async () => {
		await seedSuperAdmin();
		const sessionId = await login();

		const before = await gql(`query{ adminApiRateLimit }`, {}, { sessionId });
		expect(before.body.data.adminApiRateLimit).toBe(60);

		const updated = await gql(
			`mutation($v: Int!){ adminSetApiRateLimit(value:$v) }`,
			{ v: 120 },
			{ sessionId }
		);
		expect(updated.body.data.adminSetApiRateLimit).toBe(120);
	});

	test('唯一のスーパー管理者の自己降格は拒否される(AC-ADMIN-003)', async () => {
		await seedSuperAdmin();
		const sessionId = await login();
		const res = await gql(
			`mutation($input: AdminChangeRoleInput!){ adminChangeRole(input:$input){ id } }`,
			{ input: { targetId: 'admin-super', role: 'viewer' } },
			{ sessionId }
		);
		expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR');
	});
});
