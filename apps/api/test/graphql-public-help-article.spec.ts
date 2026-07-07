// ヘルプ記事の公開閲覧 GraphQL の統合テスト(BR-CONTENT-005)。
// admin 側で作成・公開した記事が、未ログイン(セッションなし)で取得できることを検証する。
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

describe('ヘルプ記事の公開閲覧 GraphQL(BR-CONTENT-005)', () => {
	test('存在しないスラッグなら publicHelpArticle は null を返す(client 側で 404 相当)', async () => {
		const res = await publicGql(`query{ publicHelpArticle(slug:"unknown"){ title } }`, {});
		expect(res.body.data.publicHelpArticle).toBeNull();
	});

	test('admin が作成・公開した記事を未ログインで取得できる', async () => {
		await seedSuperAdmin();
		const sessionId = await loginAdmin();

		await adminGql(
			`mutation($input: HelpArticleInputType!){ adminUpsertHelpArticle(input:$input){ id } }`,
			{
				input: {
					title: 'プロフィールの編集方法',
					slug: 'edit-profile',
					category: 'アカウント',
					bodyMarkdown: '# プロフィールの編集方法\n\n本文です。',
					status: 'published'
				}
			},
			sessionId
		);

		const res = await publicGql(
			`query{ publicHelpArticle(slug:"edit-profile"){ title slug category bodyMarkdown } }`,
			{}
		);
		expect(res.body.data.publicHelpArticle).toEqual({
			title: 'プロフィールの編集方法',
			slug: 'edit-profile',
			category: 'アカウント',
			bodyMarkdown: '# プロフィールの編集方法\n\n本文です。'
		});
	});

	test('非公開記事は publicHelpArticle で取得できない(AC: 非公開記事は表示されない)', async () => {
		await seedSuperAdmin();
		const sessionId = await loginAdmin();

		await adminGql(
			`mutation($input: HelpArticleInputType!){ adminUpsertHelpArticle(input:$input){ id } }`,
			{
				input: {
					title: '下書き記事',
					slug: 'draft-article',
					bodyMarkdown: '# 下書き',
					status: 'unpublished'
				}
			},
			sessionId
		);

		const res = await publicGql(`query{ publicHelpArticle(slug:"draft-article"){ title } }`, {});
		expect(res.body.data.publicHelpArticle).toBeNull();
	});

	test('publicHelpArticles は公開記事のみ一覧で返す(非公開は含まない)', async () => {
		await seedSuperAdmin();
		const sessionId = await loginAdmin();
		const mk = async (input: Record<string, unknown>) =>
			adminGql(
				`mutation($input: HelpArticleInputType!){ adminUpsertHelpArticle(input:$input){ id } }`,
				{ input },
				sessionId
			);
		await mk({
			title: '公開記事',
			slug: 'published-article',
			bodyMarkdown: '# 公開',
			status: 'published'
		});
		await mk({
			title: '非公開記事',
			slug: 'unpublished-article',
			bodyMarkdown: '# 非公開',
			status: 'unpublished'
		});

		const res = await publicGql(`query{ publicHelpArticles{ slug } }`, {});
		expect(res.body.data.publicHelpArticles).toEqual([{ slug: 'published-article' }]);
	});

	test('不正なスラッグ(空文字)は VALIDATION_ERROR になる(境界検証)', async () => {
		const res = await publicGql(`query{ publicHelpArticle(slug:""){ title } }`, {});
		expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR');
	});
});
