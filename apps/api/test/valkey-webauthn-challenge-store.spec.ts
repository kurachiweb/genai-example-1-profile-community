// ValkeyWebauthnChallengeStore の統合テスト(ioredis-mock)。
// チャレンジは短命・ワンタイム(db §7)であることを検証する。
import type Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { ValkeyWebauthnChallengeStore } from '../src/infrastructure/webauthn-challenge.store';
import { WEBAUTHN_CHALLENGE_TTL_SECONDS } from '../src/domain/admin-limits';

describe('ValkeyWebauthnChallengeStore', () => {
	let client: Redis;
	let store: ValkeyWebauthnChallengeStore;

	beforeEach(() => {
		client = new RedisMock();
		store = new ValkeyWebauthnChallengeStore(client);
	});

	test('put() したチャレンジを take() で取得できる', async () => {
		await store.put('reg:admin:admin-1', 'challenge-value');
		expect(await store.take('reg:admin:admin-1')).toBe('challenge-value');
	});

	test('take() はワンタイムであり、2 度目は null を返す', async () => {
		await store.put('reg:admin:admin-1', 'challenge-value');
		await store.take('reg:admin:admin-1');
		expect(await store.take('reg:admin:admin-1')).toBeNull();
	});

	test('未登録の key は take() が null を返す', async () => {
		expect(await store.take('unknown-key')).toBeNull();
	});

	test(`put() は TTL ${WEBAUTHN_CHALLENGE_TTL_SECONDS}秒で Valkey に保存する`, async () => {
		await store.put('reg:admin:admin-1', 'challenge-value');
		const ttl = await client.ttl('tok:webauthn:reg:admin:admin-1');
		expect(ttl).toBe(WEBAUTHN_CHALLENGE_TTL_SECONDS);
	});
});
