// §08 コンテンツ系 GraphQL の統合テスト(Nest Testing + インメモリ SQLite + Supertest)。
// メール配信(SMTP)は外部依存のため統合テストでは扱わず、ユースケース単体で検証済み。
import { hashPassword } from '../src/infrastructure/password-hasher';
import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AdminRole } from '../src/domain/admin-role';
import { AppModule } from '../src/app.module';
import { AdminAccountEntity } from '../src/infrastructure/persistence/entities/admin-account.entity';
import { InquiryEntity } from '../src/infrastructure/persistence/entities/inquiry.entity';
import { ADMIN_SESSION_STORE } from '../src/application/admin/gateways';
import { InMemoryAdminSessionStore } from '../src/application/admin/fakes';

let app: INestApplication;
let orm: MikroORM;

// テスト用ペッパー(32文字以上の最小要件を満たす固定値、env.ts の PASSWORD_PEPPER_MIN_LENGTH 参照)。
const TEST_PEPPER = 'integration-test-pepper-aaaaaaaaaaaaaaaaaaaaaaaa';

beforeAll(async () => {
	process.env.DATABASE_URL = ':memory:';
	process.env.NODE_ENV = 'test';
	// PBKDF2 のイテレーション数上限を補うペッパー(password-hasher.ts §HMAC事前処理)。
	process.env.PASSWORD_PEPPER = TEST_PEPPER;
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

const PASSWORD = 'super-admin-password-123';

async function seedSuperAdmin(): Promise<void> {
	const em = orm.em.fork();
	em.create(AdminAccountEntity, {
		id: 'admin-super',
		email: 'super@example.com',
		emailNormalized: 'super@example.com',
		passwordHash: await hashPassword(PASSWORD, TEST_PEPPER),
		role: AdminRole.SUPER_ADMIN,
		status: 'active'
	});
	await em.flush();
}

async function gql(query: string, variables: Record<string, unknown>, sessionId?: string) {
	const req = request(app.getHttpServer()).post('/graphql');
	if (sessionId) req.set('x-admin-session', sessionId);
	return req.send({ query, variables });
}

async function login(): Promise<string> {
	const res = await gql(
		`mutation($input: AdminLoginInput!){ adminLogin(input:$input){ sessionId } }`,
		{ input: { email: 'super@example.com', password: PASSWORD } }
	);
	return res.body.data.adminLogin.sessionId as string;
}

describe('管理者 §08 コンテンツ GraphQL 統合', () => {
	test('お知らせを作成→公開でき一覧に published で出る(AC-CONTENT-001)', async () => {
		await seedSuperAdmin();
		const sessionId = await login();

		const created = await gql(
			`mutation($input: AnnouncementInputType!){ adminCreateAnnouncement(input:$input){ id status } }`,
			{ input: { title: 'メンテナンスのお知らせ', bodyMarkdown: '# 本文' } },
			sessionId
		);
		const id = created.body.data.adminCreateAnnouncement.id;
		expect(created.body.data.adminCreateAnnouncement.status).toBe('draft');

		await gql(
			`mutation($id:String!){ adminPublishAnnouncement(id:$id){ status } }`,
			{ id },
			sessionId
		);

		const list = await gql(`query{ adminAnnouncements{ id status } }`, {}, sessionId);
		expect(list.body.data.adminAnnouncements[0].status).toBe('published');
	});

	test('ヘルプ記事の重複スラッグは VALIDATION_ERROR(BR-CONTENT-005)', async () => {
		await seedSuperAdmin();
		const sessionId = await login();
		const base = { title: 'FAQ', slug: 'faq', bodyMarkdown: '本文' };
		await gql(
			`mutation($input: HelpArticleInputType!){ adminUpsertHelpArticle(input:$input){ id } }`,
			{ input: base },
			sessionId
		);
		const dup = await gql(
			`mutation($input: HelpArticleInputType!){ adminUpsertHelpArticle(input:$input){ id } }`,
			{ input: { title: 'FAQ2', slug: 'faq', bodyMarkdown: 'x' } },
			sessionId
		);
		expect(dup.body.errors[0].extensions.code).toBe('VALIDATION_ERROR');
	});

	test('規約の新版発効で公開中は1版のみになる(AC-CONTENT-009)', async () => {
		await seedSuperAdmin();
		const sessionId = await login();
		const mk = async (body: string) =>
			gql(
				`mutation($input: PolicyVersionInputType!){ adminCreatePolicyVersion(input:$input){ id version } }`,
				{
					input: {
						type: 'terms',
						bodyMarkdown: body,
						requiresReconsent: false,
						effectiveDate: '2026-09-01T00:00:00Z'
					}
				},
				sessionId
			);
		const v1 = (await mk('v1')).body.data.adminCreatePolicyVersion;
		const v2 = (await mk('v2')).body.data.adminCreatePolicyVersion;
		expect(v2.version).toBe(2);

		await gql(
			`mutation($id:String!){ adminPublishPolicy(id:$id){ isPublished } }`,
			{ id: v1.id },
			sessionId
		);
		await gql(
			`mutation($id:String!){ adminPublishPolicy(id:$id){ isPublished } }`,
			{ id: v2.id },
			sessionId
		);

		const list = await gql(`query{ adminPolicies(type:"terms"){ id isPublished } }`, {}, sessionId);
		const published = list.body.data.adminPolicies.filter(
			(p: { isPublished: boolean }) => p.isPublished
		);
		expect(published).toHaveLength(1);
		expect(published[0].id).toBe(v2.id);
	});

	test('問い合わせの状態を更新できる(BR-CONTENT-007)', async () => {
		await seedSuperAdmin();
		const em = orm.em.fork();
		em.create(InquiryEntity, {
			id: 'iq-1',
			category: 'general',
			subject: '質問',
			body: '本文',
			contactEmail: 'u@example.com',
			status: 'OPEN',
			createdByUserId: null
		});
		await em.flush();
		const sessionId = await login();

		const updated = await gql(
			`mutation($id:String!,$status:String!){ adminUpdateInquiryStatus(id:$id,status:$status){ status } }`,
			{ id: 'iq-1', status: 'IN_PROGRESS' },
			sessionId
		);
		expect(updated.body.data.adminUpdateInquiryStatus.status).toBe('IN_PROGRESS');
	});

	test('メール下書きを作成でき、テンプレ一覧を取得できる', async () => {
		await seedSuperAdmin();
		const sessionId = await login();
		const created = await gql(
			`mutation($input: EmailNotificationInputType!){ adminCreateEmailNotification(input:$input){ id status } }`,
			{
				input: {
					subject: '新機能のお知らせ',
					templateKey: 'feature_update',
					targetCondition: 'all'
				}
			},
			sessionId
		);
		expect(created.body.data.adminCreateEmailNotification.status).toBe('draft');

		const templates = await gql(`query{ adminEmailTemplates{ key label } }`, {}, sessionId);
		expect(templates.body.data.adminEmailTemplates.length).toBeGreaterThan(0);
	});
});
