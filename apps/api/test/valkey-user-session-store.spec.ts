// ValkeyUserSessionStore の統合テスト(ioredis-mock で Valkey/Redis 互換の振る舞いを再現)。
// 有効 30 日のスライディング TTL(BR-COMMON-001)を検証する(testing/01 §2.3 相当)。
import type Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import {
	USER_SESSION_TTL_SECONDS,
	ValkeyUserSessionStore
} from '../src/infrastructure/user-session.store';
import { hashToken } from '../src/infrastructure/token-hash';

describe('ValkeyUserSessionStore', () => {
	let client: Redis;
	let store: ValkeyUserSessionStore;

	beforeEach(() => {
		client = new RedisMock();
		store = new ValkeyUserSessionStore(client);
	});

	test('create() で発行したセッションを resolve() で取得できる', async () => {
		const session = await store.create('user-1');
		expect(session.userId).toBe('user-1');

		const resolved = await store.resolve(session.sessionId);
		expect(resolved).toEqual({ sessionId: session.sessionId, userId: 'user-1' });
	});

	test('未知の sessionId は resolve() が null を返す', async () => {
		expect(await store.resolve('unknown-session')).toBeNull();
	});

	test('destroy() 後は resolve() が null を返す', async () => {
		const session = await store.create('user-1');
		await store.destroy(session.sessionId);
		expect(await store.resolve(session.sessionId)).toBeNull();
	});

	test('create() は TTL 30 日(スライディング)で Valkey に保存する', async () => {
		const session = await store.create('user-1');
		const ttl = await client.ttl(`sess:client:${hashToken(session.sessionId)}`);
		expect(ttl).toBe(USER_SESSION_TTL_SECONDS);
	});

	test('resolve() のたびに TTL がスライディング更新される', async () => {
		const session = await store.create('user-1');
		await client.expire(`sess:client:${hashToken(session.sessionId)}`, 10);

		await store.resolve(session.sessionId);

		const ttl = await client.ttl(`sess:client:${hashToken(session.sessionId)}`);
		expect(ttl).toBe(USER_SESSION_TTL_SECONDS);
	});

	test('利用者セッションと管理者セッションはキー名前空間が分離される', async () => {
		const session = await store.create('user-1');
		expect(await client.get(`sess:admin:${hashToken(session.sessionId)}`)).toBeNull();
	});

	test('セッションIDは平文のままキーに使われない(BR-COMMON-014)', async () => {
		const session = await store.create('user-1');
		expect(await client.get(`sess:client:${session.sessionId}`)).toBeNull();
	});
});
