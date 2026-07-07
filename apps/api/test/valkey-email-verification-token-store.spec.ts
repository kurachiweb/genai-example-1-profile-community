// ValkeyEmailVerificationTokenStore の統合テスト(ioredis-mock)。
// メール確認・パスワードリセット・メール変更の各トークンが 24h・ワンタイムであることを検証する(db §7)。
import type Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { ValkeyEmailVerificationTokenStore } from '../src/infrastructure/email-verification-token.store';
import { hashToken } from '../src/infrastructure/token-hash';

const TWENTY_FOUR_HOURS_SECONDS = 24 * 60 * 60;

describe('ValkeyEmailVerificationTokenStore', () => {
	let client: Redis;
	let store: ValkeyEmailVerificationTokenStore;

	beforeEach(() => {
		client = new RedisMock();
		store = new ValkeyEmailVerificationTokenStore(client);
	});

	test('create() で発行したトークンを consume() で取得できる', async () => {
		const token = await store.create('user-1', 'verify');
		const result = await store.consume(token, 'verify');
		expect(result).toEqual({ userId: 'user-1', extra: undefined });
	});

	test('extra を伴うトークン(メール変更など)を保持できる', async () => {
		const token = await store.create('user-1', 'change_email', 'new@example.com');
		const result = await store.consume(token, 'change_email');
		expect(result).toEqual({ userId: 'user-1', extra: 'new@example.com' });
	});

	test('consume() はワンタイムであり、2 度目は null を返す', async () => {
		const token = await store.create('user-1', 'reset');
		await store.consume(token, 'reset');
		expect(await store.consume(token, 'reset')).toBeNull();
	});

	test('未知のトークンは consume() が null を返す', async () => {
		expect(await store.consume('unknown-token', 'verify')).toBeNull();
	});

	test('type が異なる名前空間のトークンは consume() が null を返す', async () => {
		const token = await store.create('user-1', 'verify');
		expect(await store.consume(token, 'reset')).toBeNull();
	});

	test(`create() は TTL ${TWENTY_FOUR_HOURS_SECONDS}秒で Valkey に保存する`, async () => {
		const token = await store.create('user-1', 'verify');
		const ttl = await client.ttl(`tok:verify:${hashToken(token)}`);
		expect(ttl).toBe(TWENTY_FOUR_HOURS_SECONDS);
	});

	test('type ごとにキー名前空間が分離される(tok:verify:/tok:reset:/tok:email:)', async () => {
		const verifyToken = await store.create('user-1', 'verify');
		const resetToken = await store.create('user-1', 'reset');
		const changeEmailToken = await store.create('user-1', 'change_email');

		expect(await client.get(`tok:verify:${hashToken(verifyToken)}`)).not.toBeNull();
		expect(await client.get(`tok:reset:${hashToken(resetToken)}`)).not.toBeNull();
		expect(await client.get(`tok:email:${hashToken(changeEmailToken)}`)).not.toBeNull();
	});

	test('トークンは平文のままキーに使われない(BR-COMMON-014)', async () => {
		const token = await store.create('user-1', 'verify');
		expect(await client.get(`tok:verify:${token}`)).toBeNull();
	});
});
