// 起動時の環境変数検証(coding/04-nestjs.md §5・ecc-common/security.md)。
// 必須シークレット/設定の欠落時は起動を失敗させる。値はハードコードせず環境変数から読む。
export interface AppEnv {
  readonly nodeEnv: string;
  readonly port: number;
  readonly databaseUrl: string;
  /** ローカル/dev でスキーマを自動同期するか。本番(D1)は wrangler マイグレーション(人間のみ)。 */
  readonly autoSyncSchema: boolean;
}

const DEFAULT_PORT = 48031;

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
  };
}
