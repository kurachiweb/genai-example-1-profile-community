// Cloudflare Workers 実行時のバインディング(D1・KV 等)を保持する(Frameworks & Drivers)。
// AppModule/各 module.ts は静的な @Module 定義のままにし(既存テストが `imports: [AppModule]` で
// 直接importするため)、worker.ts起動時にここへバインディングを登録する形で D1/KV 接続へ切り替える。
import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

let d1Database: D1Database | undefined;
let sessionClientKV: KVNamespace | undefined;
let sessionAdminKV: KVNamespace | undefined;
let appKV: KVNamespace | undefined;

/** worker.ts から起動時に一度だけ呼ぶ。ローカル/dev(main.ts)では呼ばれない。 */
export function setD1Database(database: D1Database): void {
	d1Database = database;
}

export function getD1Database(): D1Database | undefined {
	return d1Database;
}

export interface WorkersKVNamespaces {
	readonly sessionClient: KVNamespace;
	readonly sessionAdmin: KVNamespace;
	readonly app: KVNamespace;
}

/** worker.ts から起動時に一度だけ呼ぶ。ローカル/dev(main.ts)では呼ばれない。 */
export function setKVNamespaces(namespaces: WorkersKVNamespaces): void {
	sessionClientKV = namespaces.sessionClient;
	sessionAdminKV = namespaces.sessionAdmin;
	appKV = namespaces.app;
}

export function getSessionClientKV(): KVNamespace | undefined {
	return sessionClientKV;
}

export function getSessionAdminKV(): KVNamespace | undefined {
	return sessionAdminKV;
}

export function getAppKV(): KVNamespace | undefined {
	return appKV;
}
