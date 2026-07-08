// Cloudflare Workers 実行時のバインディング(D1)を保持する(Frameworks & Drivers)。
// AppModule は静的な @Module 定義のままにし(既存テストが `imports: [AppModule]` で
// 直接importするため)、worker.ts起動時にここへバインディングを登録する形で D1 接続へ切り替える。
import type { D1Database } from '@cloudflare/workers-types';

let d1Database: D1Database | undefined;

/** worker.ts から起動時に一度だけ呼ぶ。ローカル/dev(main.ts)では呼ばれない。 */
export function setD1Database(database: D1Database): void {
	d1Database = database;
}

export function getD1Database(): D1Database | undefined {
	return d1Database;
}
