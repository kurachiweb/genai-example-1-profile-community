import { loadEnv } from './env';

describe('loadEnv(起動時の環境変数検証)', () => {
	test('DATABASE_URL 未設定は起動失敗(例外)', () => {
		expect(() => loadEnv({})).toThrow(/DATABASE_URL/);
	});

	test('既定ポート 48031・development を返す', () => {
		const env = loadEnv({ DATABASE_URL: 'file:/tmp/x.sqlite' });
		expect(env.port).toBe(48031);
		expect(env.nodeEnv).toBe('development');
		expect(env.autoSyncSchema).toBe(true);
	});

	test('本番ではスキーマ自動同期を無効化する(D1 は wrangler マイグレーション)', () => {
		const env = loadEnv({ DATABASE_URL: 'file:/tmp/x.sqlite', NODE_ENV: 'production' });
		expect(env.autoSyncSchema).toBe(false);
	});

	test('不正なポートは起動失敗', () => {
		expect(() => loadEnv({ DATABASE_URL: 'file:/tmp/x.sqlite', PORT: 'abc' })).toThrow(/PORT/);
	});
});
