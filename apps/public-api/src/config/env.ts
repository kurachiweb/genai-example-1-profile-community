// 起動時の環境変数検証(coding/04-nestjs.md §5・ecc-common/security.md)。
// 必須シークレット/設定の欠落時は起動を失敗させる。値はハードコードせず環境変数から読む。
export interface AppEnv {
	readonly nodeEnv: string;
	readonly port: number;
	readonly databaseUrl: string;
	/** ローカル/dev でスキーマを自動同期するか。本番(D1)は wrangler マイグレーション(人間のみ)。 */
	readonly autoSyncSchema: boolean;
	/** レート制限の時間窓(秒)。BR-API-008 は 1 分窓。 */
	readonly rateLimitWindowSeconds: number;
	/** レート制限のしきい値(リクエスト数/窓/キー)。既定値の正本は BR-API-008(60/分)。 */
	readonly rateLimitPerWindow: number;
}

const DEFAULT_PORT = 48034;
// しきい値の既定は BR-API-008(60 req/分/キー)。本番のエッジ閾値は Terraform 管理(値の正本は features/)。
const DEFAULT_RATE_LIMIT_WINDOW_SECONDS = 60;
const DEFAULT_RATE_LIMIT_PER_WINDOW = 60;

function parsePositiveInt(raw: string | undefined, fallback: number, name: string): number {
	if (raw === undefined || raw.trim().length === 0) {
		return fallback;
	}
	const value = Number(raw);
	if (!Number.isInteger(value) || value <= 0) {
		throw new Error(`環境変数 ${name} が不正です: ${raw}`);
	}
	return value;
}

export function loadEnv(env: NodeJS.ProcessEnv = process.env): AppEnv {
	const databaseUrl = env.DATABASE_URL;
	if (!databaseUrl || databaseUrl.trim().length === 0) {
		throw new Error('環境変数 DATABASE_URL が設定されていません。');
	}

	const port = parsePositiveInt(
		env.PUBLIC_API_DEV_PORT ?? env.PORT,
		DEFAULT_PORT,
		'PUBLIC_API_DEV_PORT/PORT'
	);
	const rateLimitWindowSeconds = parsePositiveInt(
		env.RATE_LIMIT_WINDOW_SECONDS,
		DEFAULT_RATE_LIMIT_WINDOW_SECONDS,
		'RATE_LIMIT_WINDOW_SECONDS'
	);
	const rateLimitPerWindow = parsePositiveInt(
		env.RATE_LIMIT_PER_WINDOW,
		DEFAULT_RATE_LIMIT_PER_WINDOW,
		'RATE_LIMIT_PER_WINDOW'
	);

	const nodeEnv = env.NODE_ENV ?? 'development';
	return {
		nodeEnv,
		port,
		databaseUrl,
		autoSyncSchema: nodeEnv !== 'production',
		rateLimitWindowSeconds,
		rateLimitPerWindow
	};
}
