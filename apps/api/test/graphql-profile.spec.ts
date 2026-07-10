// 内部 GraphQL API の統合テスト(Nest Testing + インメモリ SQLite + Supertest)。
// 認可・実効公開ゲート・エラー表現(extensions.code)・カーソル接続・DataLoader を検証する(testing/01 §2.2)。
import { hashPassword } from '../src/infrastructure/password-hasher';
import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { NameDisplayOrder } from '../src/domain/display-name';
import { Visibility } from '../src/domain/effective-public';
import { UserStatus } from '../src/domain/user-status';
import { AppModule } from '../src/app.module';
import { ProfileEntity } from '../src/infrastructure/persistence/entities/profile.entity';
import { ReportEntity } from '../src/infrastructure/persistence/entities/report.entity';
import { UserEntity } from '../src/infrastructure/persistence/entities/user.entity';
import { buildValidationPipe } from '../src/interface/graphql/validation';
import { USER_SESSION_STORE } from '../src/infrastructure/user-session.store';
import { InMemoryUserSessionStore } from '../src/application/fakes';

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
		.overrideProvider(USER_SESSION_STORE)
		.useValue(new InMemoryUserSessionStore({ now: () => new Date() }))
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

const TEST_PASSWORD = 'password-123456';

interface SeedOptions {
	status?: UserStatus;
	visibility?: Visibility;
	occupation?: string | null;
}

async function seed(id: string, handle: string, options: SeedOptions = {}): Promise<void> {
	const em = orm.em.fork();
	const user = em.create(UserEntity, {
		id: `user-${id}`,
		email: `${id}@example.com`,
		emailNormalized: `${id}@example.com`,
		passwordHash: await hashPassword(TEST_PASSWORD, TEST_PEPPER),
		status: options.status ?? UserStatus.ACTIVE
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
	await em.flush();
}

interface GraphQLBody {
	query: string;
	variables?: Record<string, unknown>;
}

function gql(body: GraphQLBody, headers: Record<string, string> = {}) {
	return request(app.getHttpServer()).post('/graphql').set(headers).send(body);
}

/** `id` のユーザーとしてログインし、`x-user-session` に使えるセッション ID を得る。 */
async function login(id: string): Promise<string> {
	const res = await gql({
		query: `mutation($input: UserLoginInput!) { login(input: $input) { sessionId } }`,
		variables: { input: { email: `${id}@example.com`, password: TEST_PASSWORD } }
	});
	return res.body.data.login.sessionId as string;
}

describe('Query profile(handle)', () => {
	test('実効公開のプロフィールを表示名付きで返す(AC-SHARE-007)', async () => {
		await seed('a', 'minato');
		const res = await gql({
			query: `query { profile(handle: "minato") { handle displayName visibility } }`
		});
		expect(res.body.data.profile).toEqual({
			handle: 'minato',
			displayName: 'みなと 里中',
			visibility: Visibility.PUBLIC
		});
	});

	test('未確認ユーザーは第三者に NOT_FOUND で秘匿(AC-SHARE-008)', async () => {
		await seed('a', 'minato', { status: UserStatus.UNVERIFIED });
		const res = await gql({ query: `query { profile(handle: "minato") { handle } }` });
		// 非 null の Query フィールドでエラーが起きると data 全体が null になる(GraphQL 仕様)。
		expect(res.body.data).toBeNull();
		expect(res.body.errors[0].extensions.code).toBe('NOT_FOUND');
	});
});

describe('Query profiles(カーソル接続)', () => {
	test('実効公開のみを edges/pageInfo で返す', async () => {
		await seed('a', 'a-handle');
		await seed('b', 'b-handle', { status: UserStatus.UNVERIFIED });
		const res = await gql({
			query: `query { profiles(first: 10) { edges { node { handle } cursor } pageInfo { hasNextPage endCursor } } }`
		});
		const handles = res.body.data.profiles.edges.map(
			(e: { node: { handle: string } }) => e.node.handle
		);
		expect(handles).toEqual(['a-handle']);
		expect(res.body.data.profiles.pageInfo.hasNextPage).toBe(false);
		expect(typeof res.body.data.profiles.pageInfo.endCursor).toBe('string');
	});
});

describe('Query myProfile(セッション)', () => {
	test('x-user-session ヘッダで本人の非公開プロフィールを取得できる(AC-API-005)', async () => {
		await seed('a', 'minato', { visibility: Visibility.PRIVATE });
		const sessionId = await login('a');
		const res = await gql(
			{ query: `query { myProfile { handle visibility } }` },
			{ 'x-user-session': sessionId }
		);
		expect(res.body.data.myProfile).toEqual({ handle: 'minato', visibility: Visibility.PRIVATE });
	});

	test('未ログインは UNAUTHORIZED', async () => {
		const res = await gql({ query: `query { myProfile { handle } }` });
		expect(res.body.errors[0].extensions.code).toBe('UNAUTHORIZED');
	});
});

describe('Mutation updateProfile', () => {
	test('内容を更新し表示名へ反映する(AC-PROF-009)', async () => {
		await seed('a', 'minato');
		const sessionId = await login('a');
		const res = await gql(
			{
				query: `mutation($input: UpdateProfileInput!) { updateProfile(input: $input) { displayName nameDisplayOrder } }`,
				variables: { input: { nameDisplayOrder: 'familyNameFirst' } }
			},
			{ 'x-user-session': sessionId }
		);
		expect(res.body.data.updateProfile).toEqual({
			displayName: '里中 みなと',
			nameDisplayOrder: 'familyNameFirst'
		});
	});

	test('自己紹介 501 文字は VALIDATION_ERROR(AC-PROF-011)', async () => {
		await seed('a', 'minato');
		const sessionId = await login('a');
		const res = await gql(
			{
				query: `mutation($input: UpdateProfileInput!) { updateProfile(input: $input) { handle } }`,
				variables: { input: { bio: 'あ'.repeat(501) } }
			},
			{ 'x-user-session': sessionId }
		);
		expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR');
	});
});

describe('Mutation changeHandle', () => {
	test('予約語は VALIDATION_ERROR(AC-SHARE-004)', async () => {
		await seed('a', 'minato');
		const sessionId = await login('a');
		const res = await gql(
			{
				query: `mutation($input: ChangeHandleInput!) { changeHandle(input: $input) { profile { handle } } }`,
				variables: { input: { handle: 'admin' } }
			},
			{ 'x-user-session': sessionId }
		);
		expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR');
	});
});

describe('Mutation reportProfile(BR-SAFE-001)', () => {
	test('実効公開プロフィールへの通報が reports テーブルへ保存される', async () => {
		await seed('a', 'minato');
		const res = await gql({
			query: `mutation($input: ReportProfileInput!) { reportProfile(input: $input) }`,
			variables: { input: { handle: 'minato', reasonCategory: 'SPAM', detail: '広告の連投' } }
		});
		expect(res.body.data.reportProfile).toBe(true);

		const reports = await orm.em.fork().find(ReportEntity, { targetHandle: 'minato' });
		expect(reports).toHaveLength(1);
		expect(reports[0]).toMatchObject({
			targetHandle: 'minato',
			targetUserId: 'user-a',
			reasonCategory: 'spam',
			detail: '広告の連投'
		});
	});

	test('未ログインでも通報できる(匿名通報)', async () => {
		await seed('a', 'minato');
		const res = await gql({
			query: `mutation($input: ReportProfileInput!) { reportProfile(input: $input) }`,
			variables: { input: { handle: 'minato', reasonCategory: 'OTHER' } }
		});
		expect(res.body.data.reportProfile).toBe(true);

		const reports = await orm.em.fork().find(ReportEntity, { targetHandle: 'minato' });
		expect(reports[0].detail).toBeNull();
	});

	test('存在しないハンドルは NOT_FOUND で reports へ保存されない(AC-SHARE-007 秘匿)', async () => {
		const res = await gql({
			query: `mutation($input: ReportProfileInput!) { reportProfile(input: $input) }`,
			variables: { input: { handle: 'none', reasonCategory: 'SPAM' } }
		});
		expect(res.body.errors[0].extensions.code).toBe('NOT_FOUND');

		const reports = await orm.em.fork().find(ReportEntity, {});
		expect(reports).toHaveLength(0);
	});

	test('不正な reasonCategory は VALIDATION_ERROR', async () => {
		await seed('a', 'minato');
		const res = await gql({
			query: `mutation($input: ReportProfileInput!) { reportProfile(input: $input) }`,
			variables: { input: { handle: 'minato', reasonCategory: 'not-a-real-category' } }
		});
		expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR');
	});
});

describe('SnsLink の DataLoader 解決', () => {
	test('replaceSnsLinks 後に profile.snsLinks が順序付きで解決される(AC-PROF-013/016)', async () => {
		await seed('a', 'minato');
		const sessionId = await login('a');
		await gql(
			{
				query: `mutation($input: ReplaceSnsLinksInput!) { replaceSnsLinks(input: $input) { snsLinks { platform sortOrder } } }`,
				variables: {
					input: {
						links: [
							{ platform: 'github', url: 'https://github.com/example' },
							{ platform: 'x', url: 'https://x.com/example' }
						]
					}
				}
			},
			{ 'x-user-session': sessionId }
		);
		const res = await gql({
			query: `query { profile(handle: "minato") { snsLinks { platform sortOrder } } }`
		});
		expect(res.body.data.profile.snsLinks).toEqual([
			{ platform: 'github', sortOrder: 0 },
			{ platform: 'x', sortOrder: 1 }
		]);
	});
});
