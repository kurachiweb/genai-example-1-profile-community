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
}

const DEFAULT_PORT = 48031;
// ローカル admin アプリ(:48033)を既定の RP とする。本番は env で上書きする。
const DEFAULT_ADMIN_ORIGIN = 'http://localhost:48033';
const DEFAULT_ADMIN_RP_ID = 'localhost';
const DEFAULT_ADMIN_RP_NAME = 'GenAI Profile Community 管理者コンソール';

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
		}
	};
}
