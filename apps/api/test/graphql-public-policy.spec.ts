// 規約・プライバシーポリシーの公開閲覧 GraphQL の統合テスト(BR-CONTENT-010)。
// admin 側で発行した版が、未ログイン(セッションなし)で取得できることを検証する。
import { hash } from '@node-rs/argon2';
import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AdminRole } from '../src/domain/admin-role';
import { AppModule } from '../src/app.module';
import { AdminAccountEntity } from '../src/infrastructure/persistence/entities/admin-account.entity';
import { ADMIN_SESSION_STORE } from '../src/application/admin/gateways';
import { InMemoryAdminSessionStore } from '../src/application/admin/fakes';
import { buildValidationPipe } from '../src/interface/graphql/validation';

let app: INestApplication;
let orm: MikroORM;

beforeAll(async () => {
	process.env.DATABASE_URL = ':memory:';
	process.env.NODE_ENV = 'test';
	const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
		.overrideProvider(ADMIN_SESSION_STORE)
		.useValue(new InMemoryAdminSessionStore({ now: () => new Date() }))
		.compile();
	app = moduleRef.createNestApplication();
	// 境界検証(class-validator の IsIn 等)を本番同様に有効化する(main.ts と同じパイプ)。
	app.useGlobalPipes(buildValidationPipe());
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

const PASSWORD = 'super-admin-password-123';

async function seedSuperAdmin(): Promise<void> {
	const em = orm.em.fork();
	em.create(AdminAccountEntity, {
		id: 'admin-super',
		email: 'super@example.com',
		emailNormalized: 'super@example.com',
		passwordHash: await hash(PASSWORD),
		role: AdminRole.SUPER_ADMIN,
		status: 'active'
	});
	await em.flush();
}

// 未ログイン(セッション ID なし)で公開 GraphQL を呼ぶ。
async function publicGql(query: string, variables: Record<string, unknown>) {
	return request(app.getHttpServer()).post('/graphql').send({ query, variables });
}

async function adminGql(query: string, variables: Record<string, unknown>, sessionId: string) {
	return request(app.getHttpServer())
		.post('/graphql')
		.set('x-admin-session', sessionId)
		.send({ query, variables });
}

async function loginAdmin(): Promise<string> {
	const res = await adminGql(
		`mutation($input: AdminLoginInput!){ adminLogin(input:$input){ sessionId } }`,
		{ input: { email: 'super@example.com', password: PASSWORD } },
		''
	);
	return res.body.data.adminLogin.sessionId as string;
}

describe('規約・プライバシーポリシーの公開閲覧 GraphQL(BR-CONTENT-010)', () => {
	test('未発行の場合 publicPolicy は null を返す(client 側で 404 相当)', async () => {
		const res = await publicGql(`query{ publicPolicy(type:"terms"){ version } }`, {});
		expect(res.body.data.publicPolicy).toBeNull();
	});

	test('admin が発行した版を未ログインで取得できる', async () => {
		await seedSuperAdmin();
		const sessionId = await loginAdmin();

		const created = await adminGql(
			`mutation($input: PolicyVersionInputType!){ adminCreatePolicyVersion(input:$input){ id } }`,
			{
				input: {
					type: 'terms',
					bodyMarkdown: '# 利用規約\n\n本文です。',
					requiresReconsent: false,
					effectiveDate: '2026-07-01T00:00:00Z'
				}
			},
			sessionId
		);
		const id = created.body.data.adminCreatePolicyVersion.id;
		await adminGql(
			`mutation($id:String!){ adminPublishPolicy(id:$id){ isPublished } }`,
			{ id },
			sessionId
		);

		// 未ログインで取得(x-admin-session ヘッダなし)。
		const res = await publicGql(
			`query{ publicPolicy(type:"terms"){ version bodyMarkdown isPublished } }`,
			{}
		);
		expect(res.body.data.publicPolicy).toEqual({
			version: 1,
			bodyMarkdown: '# 利用規約\n\n本文です。',
			isPublished: true
		});
	});

	test('新版発効後も過去版を publicPolicyVersions / publicPolicyVersion で参照できる(過去版も参照可能)', async () => {
		await seedSuperAdmin();
		const sessionId = await loginAdmin();
		const mk = async (body: string) =>
			(
				await adminGql(
					`mutation($input: PolicyVersionInputType!){ adminCreatePolicyVersion(input:$input){ id version } }`,
					{
						input: {
							type: 'privacy',
							bodyMarkdown: body,
							requiresReconsent: false,
							effectiveDate: '2026-07-01T00:00:00Z'
						}
					},
					sessionId
				)
			).body.data.adminCreatePolicyVersion;
		const v1 = await mk('# v1');
		const v2 = await mk('# v2');
		await adminGql(
			`mutation($id:String!){ adminPublishPolicy(id:$id){ id } }`,
			{ id: v1.id },
			sessionId
		);
		await adminGql(
			`mutation($id:String!){ adminPublishPolicy(id:$id){ id } }`,
			{ id: v2.id },
			sessionId
		);

		const versions = await publicGql(
			`query{ publicPolicyVersions(type:"privacy"){ version isPublished } }`,
			{}
		);
		expect(versions.body.data.publicPolicyVersions).toEqual([
			{ version: 2, isPublished: true },
			{ version: 1, isPublished: false }
		]);

		const oldVersion = await publicGql(
			`query{ publicPolicyVersion(type:"privacy", version:1){ bodyMarkdown isPublished } }`,
			{}
		);
		expect(oldVersion.body.data.publicPolicyVersion).toEqual({
			bodyMarkdown: '# v1',
			isPublished: false
		});
	});

	test('不正な type は VALIDATION_ERROR になる(境界検証)', async () => {
		const res = await publicGql(`query{ publicPolicy(type:"invalid"){ version } }`, {});
		expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR');
	});
});
