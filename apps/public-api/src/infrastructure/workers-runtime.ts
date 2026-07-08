// Cloudflare Workers 実行時のバインディング(D1・APIキー単位レート制限用DO)を保持する
// (Frameworks & Drivers)。AppModule/ProfileModule は静的な @Module 定義のままにし
// (既存テストが `imports: [AppModule]` で直接importするため)、worker.ts起動時にここへ
// バインディングを登録する形で D1 接続・DOバックエンドのレート制限へ切り替える。
import type { D1Database } from '@cloudflare/workers-types';
import type { ApiKeyRateLimiterNamespace } from './rate-limit/rate-limiter-namespace';

let d1Database: D1Database | undefined;
let rateLimiterNamespace: ApiKeyRateLimiterNamespace | undefined;

/** worker.ts から起動時に一度だけ呼ぶ。ローカル/dev(main.ts)では呼ばれない。 */
export function setD1Database(database: D1Database): void {
	d1Database = database;
}

export function getD1Database(): D1Database | undefined {
	return d1Database;
}

/** worker.ts から起動時に一度だけ呼ぶ。ローカル/dev(main.ts)では呼ばれない(ADR 20260604)。 */
export function setRateLimiterNamespace(namespace: ApiKeyRateLimiterNamespace): void {
	rateLimiterNamespace = namespace;
}

export function getRateLimiterNamespace(): ApiKeyRateLimiterNamespace | undefined {
	return rateLimiterNamespace;
}
