// MikroORM 設定(Frameworks & Drivers)。ローカルは SQLite、本番は D1(SQLite 互換・同一スキーマ)。
// ドライバ差は本層で吸収し、Entities/Use Cases に持ち込まない(mikroorm §8)。
// 内部 API(apps/api)と同一スキーマを参照する(同じ D1 / 同じ SQLite ファイル)。
// MikroORM 7 は EntitySchema でメタデータを明示するため reflect メタデータプロバイダは不要(ADR 20260617)。
import type { D1Database } from '@cloudflare/workers-types';
import { UnderscoreNamingStrategy } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/sqlite';
import { D1Dialect } from 'kysely-d1';
// mikro-orm compile で事前生成した関数群(eval/new Functionを禁止するWorkers向け、下記参照)。
import compiledFunctions from './compiled-functions.js';
import { apiKeySchema } from './persistence/entities/api-key.entity';
import { appSettingSchema } from './persistence/entities/app-setting.entity';
import { profileSchema } from './persistence/entities/profile.entity';
import { snsLinkSchema } from './persistence/entities/sns-link.entity';
import { userSchema } from './persistence/entities/user.entity';

export const ENTITIES = [userSchema, profileSchema, snsLinkSchema, apiKeySchema, appSettingSchema];

/** DATABASE_URL(`file:/path` 形式)または `:memory:` から SQLite のパスを解決する。 */
export function resolveDbName(databaseUrl?: string): string {
	if (!databaseUrl || databaseUrl === ':memory:') {
		return ':memory:';
	}
	return databaseUrl.startsWith('file:') ? databaseUrl.slice('file:'.length) : databaseUrl;
}

const COMMON_OPTIONS = {
	entities: ENTITIES,
	// TS camelCase ↔ DB snake_case(db/00-overview §3)。
	namingStrategy: UnderscoreNamingStrategy,
	// 時刻は UTC 保存・読み出し(BR-COMMON-015)。
	forceUtcTimezone: true,
	// 各操作で em.fork() するため、グローバル EM の利用を許容する(リクエスト混線は fork で回避)。
	allowGlobalContext: true,
	debug: false
};

/** ローカル/dev(Node)向け。SQLiteファイル(または :memory:)に直接接続する。 */
export function buildMikroOrmConfig(dbName: string) {
	return defineConfig({
		dbName,
		...COMMON_OPTIONS
	});
}

/**
 * 本番(Cloudflare Workers)向け。D1 バインディングを Kysely 経由で接続する
 * (MikroORM の D1 サポートは実験的機能、db/02-migrations.md 参照)。
 * D1 は明示的なトランザクション文をサポートしないため implicitTransactions を無効化する。
 * Workers は eval/new Function を禁止する(リクエスト処理中)ため、MikroORM が実行時に生成する
 * ハイドレータ/コンパレータ等の最適化関数を `mikro-orm compile` で事前生成した
 * compiled-functions.js を渡して回避する(エンティティ変更時は再生成すること)。
 * マイグレーションの正本は apps/api(ADR 20260617)。本アプリは同一 D1 を参照するのみ。
 */
export function buildMikroOrmConfigForD1(database: D1Database) {
	return defineConfig({
		dbName: 'd1',
		driverOptions: new D1Dialect({ database }),
		implicitTransactions: false,
		compiledFunctions,
		...COMMON_OPTIONS
	});
}

// MikroORM CLI / スタンドアロン用途のデフォルトエクスポート。
export default buildMikroOrmConfig(resolveDbName(process.env.DATABASE_URL));
