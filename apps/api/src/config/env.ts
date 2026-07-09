// 起動時の環境変数検証(coding/04-nestjs.md §5・ecc-common/security.md)。
// 必須シークレット/設定の欠落時は起動を失敗させる。値はハードコードせず環境変数から読む。
export interface WebauthnEnv {
	readonly rpName: string;
	readonly rpId: string;
	readonly origin: string;
}

export interface AppEnv {
	readonly nodeEnv: string;
	readonly port: number;
	readonly databaseUrl: string;
	/** ローカル/dev でスキーマを自動同期するか。本番(D1)は wrangler マイグレーション(人間のみ)。 */
	readonly autoSyncSchema: boolean;
	/** 管理者 WebAuthn(パスキー)の RP 設定。origin/rpId は admin アプリのドメインに一致させる。 */
	readonly adminWebauthn: WebauthnEnv;
	/** 利用者向け Web(client)のオリジン。確認メール等のリンク組み立てに使う。 */
	readonly clientOrigin: string;
	/** セッション/ワンタイムトークンの保存先(本番は Cloudflare KV、ローカルは Valkey、db §7)。 */
	readonly valkeyUrl: string;
	/**
	 * パスワードハッシュ化(PBKDF2)のペッパー。Cloudflare Workers の crypto.subtle が課す
	 * イテレーション数上限(100,000、BR-COMMON-003)を補うための、DB とは独立した秘密鍵
	 * (password-hasher.ts §HMAC事前処理)。本番/dev は Wrangler Secrets で供給する。
	 */
	readonly passwordPepper: string;
}

const DEFAULT_PORT = 48031;
// password-hasher.ts の PEPPER_MIN_LENGTH と同じ基準(256bit相当のランダム値を要求)。
const PASSWORD_PEPPER_MIN_LENGTH = 32;
// ローカルの Valkey コンテナ(docker compose サービス名、compose.yaml 参照)。
const DEFAULT_VALKEY_URL = 'redis://valkey:6379';
// ローカル admin アプリ(:48033)を既定の RP とする。本番は env で上書きする。
const DEFAULT_ADMIN_ORIGIN = 'http://localhost:48033';
const DEFAULT_ADMIN_RP_ID = 'localhost';
const DEFAULT_ADMIN_RP_NAME = 'GenAI Profile Community 管理者コンソール';
// ローカル client アプリ(:48032)を既定のオリジンとする。本番は env で上書きする。
const DEFAULT_CLIENT_ORIGIN = 'http://localhost:48032';

export function loadEnv(env: NodeJS.ProcessEnv = process.env): AppEnv {
	const databaseUrl = env.DATABASE_URL;
	if (!databaseUrl || databaseUrl.trim().length === 0) {
		throw new Error('環境変数 DATABASE_URL が設定されていません。');
	}

	const rawPort = env.API_DEV_PORT ?? env.PORT;
	const port = rawPort ? Number(rawPort) : DEFAULT_PORT;
	if (!Number.isInteger(port) || port <= 0) {
		throw new Error(`環境変数 API_DEV_PORT/PORT が不正です: ${String(rawPort)}`);
	}

	const passwordPepper = env.PASSWORD_PEPPER;
	if (!passwordPepper || passwordPepper.length < PASSWORD_PEPPER_MIN_LENGTH) {
		throw new Error(
			`環境変数 PASSWORD_PEPPER が未設定、または短すぎます(${PASSWORD_PEPPER_MIN_LENGTH}文字以上が必要)。`
		);
	}

	const nodeEnv = env.NODE_ENV ?? 'development';
	return {
		nodeEnv,
		port,
		databaseUrl,
		autoSyncSchema: nodeEnv !== 'production',
		adminWebauthn: {
			rpName: env.ADMIN_WEBAUTHN_RP_NAME ?? DEFAULT_ADMIN_RP_NAME,
			rpId: env.ADMIN_WEBAUTHN_RP_ID ?? DEFAULT_ADMIN_RP_ID,
			origin: env.ADMIN_WEBAUTHN_ORIGIN ?? DEFAULT_ADMIN_ORIGIN
		},
		clientOrigin: env.CLIENT_ORIGIN ?? DEFAULT_CLIENT_ORIGIN,
		valkeyUrl: env.VALKEY_URL ?? DEFAULT_VALKEY_URL,
		passwordPepper
	};
}
