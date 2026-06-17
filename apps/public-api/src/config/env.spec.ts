import { loadEnv } from './env';

describe('loadEnv(起動時環境変数検証)', () => {
	test('DATABASE_URL 欠如は起動失敗', () => {
		expect(() => loadEnv({})).toThrow(/DATABASE_URL/);
	});

	test('既定値: ポート 48034・レート制限 60/60s・本番以外は autoSync', () => {
		const env = loadEnv({ DATABASE_URL: ':memory:', NODE_ENV: 'development' });
		expect(env.port).toBe(48034);
		expect(env.rateLimitWindowSeconds).toBe(60);
		expect(env.rateLimitPerWindow).toBe(60);
		expect(env.autoSyncSchema).toBe(true);
	});

	test('production では autoSyncSchema が false', () => {
		const env = loadEnv({ DATABASE_URL: 'file:/tmp/x.sqlite', NODE_ENV: 'production' });
		expect(env.autoSyncSchema).toBe(false);
	});

	test('レート制限しきい値を環境変数で上書きできる(BR-ADMIN-008 の運用反映)', () => {
		const env = loadEnv({ DATABASE_URL: ':memory:', RATE_LIMIT_PER_WINDOW: '120' });
		expect(env.rateLimitPerWindow).toBe(120);
	});

	test('不正なポートは起動失敗', () => {
		expect(() => loadEnv({ DATABASE_URL: ':memory:', PORT: 'abc' })).toThrow(/PORT/);
	});
});
