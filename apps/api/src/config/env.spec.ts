import { loadEnv } from './env';

// テスト用ペッパー(32文字以上の最小要件を満たす固定値)。
const VALID_PEPPER = 'test-pepper-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

describe('loadEnv(起動時の環境変数検証)', () => {
	test('DATABASE_URL 未設定は起動失敗(例外)', () => {
		expect(() => loadEnv({ PASSWORD_PEPPER: VALID_PEPPER })).toThrow(/DATABASE_URL/);
	});

	test('既定ポート 48031・development を返す', () => {
		const env = loadEnv({ DATABASE_URL: 'file:/tmp/x.sqlite', PASSWORD_PEPPER: VALID_PEPPER });
		expect(env.port).toBe(48031);
		expect(env.nodeEnv).toBe('development');
		expect(env.autoSyncSchema).toBe(true);
	});

	test('本番ではスキーマ自動同期を無効化する(D1 は wrangler マイグレーション)', () => {
		const env = loadEnv({
			DATABASE_URL: 'file:/tmp/x.sqlite',
			NODE_ENV: 'production',
			PASSWORD_PEPPER: VALID_PEPPER
		});
		expect(env.autoSyncSchema).toBe(false);
	});

	test('不正なポートは起動失敗', () => {
		expect(() =>
			loadEnv({ DATABASE_URL: 'file:/tmp/x.sqlite', PORT: 'abc', PASSWORD_PEPPER: VALID_PEPPER })
		).toThrow(/PORT/);
	});

	test('VALKEY_URL 未設定時は docker compose の valkey サービスを既定値とする', () => {
		const env = loadEnv({ DATABASE_URL: 'file:/tmp/x.sqlite', PASSWORD_PEPPER: VALID_PEPPER });
		expect(env.valkeyUrl).toBe('redis://valkey:6379');
	});

	test('VALKEY_URL 設定時はその値を優先する', () => {
		const env = loadEnv({
			DATABASE_URL: 'file:/tmp/x.sqlite',
			VALKEY_URL: 'redis://localhost:48036',
			PASSWORD_PEPPER: VALID_PEPPER
		});
		expect(env.valkeyUrl).toBe('redis://localhost:48036');
	});

	// PBKDF2 のイテレーション数上限(100,000)を補う必須シークレット(password-hasher.ts 参照)。
	// 欠落・弱い値のまま起動しないことを保証する。
	test('PASSWORD_PEPPER 未設定は起動失敗(例外)', () => {
		expect(() => loadEnv({ DATABASE_URL: 'file:/tmp/x.sqlite' })).toThrow(/PASSWORD_PEPPER/);
	});

	test('PASSWORD_PEPPER が短すぎる場合は起動失敗(例外)', () => {
		expect(() =>
			loadEnv({ DATABASE_URL: 'file:/tmp/x.sqlite', PASSWORD_PEPPER: 'too-short' })
		).toThrow(/PASSWORD_PEPPER/);
	});

	test('PASSWORD_PEPPER が十分な長さの場合は返り値に含まれる', () => {
		const env = loadEnv({ DATABASE_URL: 'file:/tmp/x.sqlite', PASSWORD_PEPPER: VALID_PEPPER });
		expect(env.passwordPepper).toBe(VALID_PEPPER);
	});
});
