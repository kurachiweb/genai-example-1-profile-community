// 内部 GraphQL API の統合テスト(Nest Testing + インメモリ SQLite + Supertest)。
// 認可・実効公開ゲート・エラー表現(extensions.code)・カーソル接続・DataLoader を検証する(testing/01 §2.2)。
import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { NameDisplayOrder } from '../src/domain/display-name';
import { Visibility } from '../src/domain/effective-public';
import { UserStatus } from '../src/domain/user-status';
import { AppModule } from '../src/app.module';
import { ProfileEntity } from '../src/infrastructure/persistence/entities/profile.entity';
import { UserEntity } from '../src/infrastructure/persistence/entities/user.entity';
import { buildValidationPipe } from '../src/interface/graphql/validation';

let app: INestApplication;
let orm: MikroORM;

beforeAll(async () => {
	process.env.DATABASE_URL = ':memory:';
	process.env.NODE_ENV = 'test';
	const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
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
		passwordHash: 'x',
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

describe('Query profile(handle)', () => {
	test('実効公開のプロフィールを表示名付きで返す(AC-SHARE-007)', async () => {
		await seed('a', 'minato');
		const res = await gql({
			query: `query { profile(handle: "minato") { handle displayName visibility } }`
		});
		expect(res.body.data.profile).toEqual({
			handle: 'minato',
			displayName: 'みなと 里中',
			visibility: 'public'
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
	test('x-user-id ヘッダで本人の非公開プロフィールを取得できる(AC-API-005)', async () => {
		await seed('a', 'minato', { visibility: Visibility.PRIVATE });
		const res = await gql(
			{ query: `query { myProfile { handle visibility } }` },
			{ 'x-user-id': 'user-a' }
		);
		expect(res.body.data.myProfile).toEqual({ handle: 'minato', visibility: 'private' });
	});

	test('未ログインは UNAUTHORIZED', async () => {
		const res = await gql({ query: `query { myProfile { handle } }` });
		expect(res.body.errors[0].extensions.code).toBe('UNAUTHORIZED');
	});
});

describe('Mutation updateProfile', () => {
	test('内容を更新し表示名へ反映する(AC-PROF-009)', async () => {
		await seed('a', 'minato');
		const res = await gql(
			{
				query: `mutation($input: UpdateProfileInput!) { updateProfile(input: $input) { profile { displayName nameDisplayOrder } } }`,
				variables: { input: { nameDisplayOrder: 'familyNameFirst' } }
			},
			{ 'x-user-id': 'user-a' }
		);
		expect(res.body.data.updateProfile.profile).toEqual({
			displayName: '里中 みなと',
			nameDisplayOrder: 'familyNameFirst'
		});
	});

	test('自己紹介 501 文字は VALIDATION_ERROR(AC-PROF-011)', async () => {
		await seed('a', 'minato');
		const res = await gql(
			{
				query: `mutation($input: UpdateProfileInput!) { updateProfile(input: $input) { profile { handle } } }`,
				variables: { input: { bio: 'あ'.repeat(501) } }
			},
			{ 'x-user-id': 'user-a' }
		);
		expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR');
	});
});

describe('Mutation changeHandle', () => {
	test('予約語は VALIDATION_ERROR(AC-SHARE-004)', async () => {
		await seed('a', 'minato');
		const res = await gql(
			{
				query: `mutation($input: ChangeHandleInput!) { changeHandle(input: $input) { profile { handle } } }`,
				variables: { input: { handle: 'admin' } }
			},
			{ 'x-user-id': 'user-a' }
		);
		expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR');
	});
});

describe('SnsLink の DataLoader 解決', () => {
	test('replaceSnsLinks 後に profile.snsLinks が順序付きで解決される(AC-PROF-013/016)', async () => {
		await seed('a', 'minato');
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
			{ 'x-user-id': 'user-a' }
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
