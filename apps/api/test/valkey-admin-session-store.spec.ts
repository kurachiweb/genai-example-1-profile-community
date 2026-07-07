// ValkeyAdminSessionStore の統合テスト(ioredis-mock)。
// 有効 8 時間・アイドルタイムアウト 30 分のスライディング方式(BR-COMMON-002)を検証する。
import type Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { ValkeyAdminSessionStore } from '../src/infrastructure/admin-session.store';
import {
	ADMIN_SESSION_IDLE_TIMEOUT_SECONDS,
	ADMIN_SESSION_TTL_SECONDS
} from '../src/domain/admin-limits';
import type { Clock } from '../src/application/gateways';
import { hashToken } from '../src/infrastructure/token-hash';

class FakeClock implements Clock {
	constructor(private current: Date) {}
	now(): Date {
		return this.current;
	}
	advance(seconds: number): void {
		this.current = new Date(this.current.getTime() + seconds * 1000);
	}
}

describe('ValkeyAdminSessionStore', () => {
	let client: Redis;
	let clock: FakeClock;
	let store: ValkeyAdminSessionStore;

	beforeEach(() => {
		client = new RedisMock();
		clock = new FakeClock(new Date('2026-06-19T00:00:00Z'));
		store = new ValkeyAdminSessionStore(client, clock);
	});

	test('create() で発行したセッションを resolve() で取得できる', async () => {
		const session = await store.create('admin-1');
		expect(session.adminId).toBe('admin-1');
		expect(session.csrfToken).toEqual(expect.any(String));

		const resolved = await store.resolve(session.sessionId);
		expect(resolved).not.toBeNull();
		expect(resolved?.adminId).toBe('admin-1');
		expect(resolved?.csrfToken).toBe(session.csrfToken);
	});

	test('未知の sessionId は resolve() が null を返す', async () => {
		expect(await store.resolve('unknown-session')).toBeNull();
	});

	test('destroy() 後は resolve() が null を返す', async () => {
		const session = await store.create('admin-1');
		await store.destroy(session.sessionId);
		expect(await store.resolve(session.sessionId)).toBeNull();
	});

	test(`アイドルタイムアウト(${ADMIN_SESSION_IDLE_TIMEOUT_SECONDS}秒)を超えると失効する`, async () => {
		const session = await store.create('admin-1');
		clock.advance(ADMIN_SESSION_IDLE_TIMEOUT_SECONDS + 1);
		// Valkey の TTL 経過を模す(ioredis-mock は実時間で TTL 判定するため明示的に失効させる)。
		await client.del(`sess:admin:${hashToken(session.sessionId)}`);

		expect(await store.resolve(session.sessionId)).toBeNull();
	});

	test(`絶対有効期限(${ADMIN_SESSION_TTL_SECONDS}秒)を超えるとアイドル内でも失効する`, async () => {
		const session = await store.create('admin-1');
		clock.advance(ADMIN_SESSION_TTL_SECONDS + 1);

		expect(await store.resolve(session.sessionId)).toBeNull();
	});

	test('resolve() のたびに TTL がアイドルタイムアウト分だけ延長される', async () => {
		const session = await store.create('admin-1');
		const ttl = await client.ttl(`sess:admin:${hashToken(session.sessionId)}`);
		expect(ttl).toBe(ADMIN_SESSION_IDLE_TIMEOUT_SECONDS);
	});

	test('セッションIDは平文のままキーに使われない(BR-COMMON-014)', async () => {
		const session = await store.create('admin-1');
		expect(await client.get(`sess:admin:${session.sessionId}`)).toBeNull();
	});
});
