// MikroORM 設定(Frameworks & Drivers)。ローカルは SQLite、本番は D1(SQLite 互換・同一スキーマ)。
// ドライバ差は本層で吸収し、Entities/Use Cases に持ち込まない(mikroorm §8)。
// MikroORM 7 は EntitySchema でメタデータを明示するため reflect メタデータプロバイダは不要(ADR 20260617)。
// ts-node はエントリーポイントから辿れるファイルのみ型検査に含めるため、kysely-d1 の
// ambient 宣言(型解決専用、下記参照)を明示的に取り込む。
/// <reference path="./kysely-d1.d.ts" />
import type { D1Database } from '@cloudflare/workers-types';
import { UnderscoreNamingStrategy } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/sqlite';
import { D1Dialect } from 'kysely-d1';
// mikro-orm compile で事前生成した関数群(eval/new Functionを禁止するWorkers向け、下記参照)。
import compiledFunctions from './compiled-functions.js';
import { adminAccountSchema } from './persistence/entities/admin-account.entity';
import { adminWebauthnCredentialSchema } from './persistence/entities/admin-webauthn-credential.entity';
import { announcementSchema } from './persistence/entities/announcement.entity';
import { apiKeySchema } from './persistence/entities/api-key.entity';
import { appSettingSchema } from './persistence/entities/app-setting.entity';
import { auditLogSchema } from './persistence/entities/audit-log.entity';
import { emailNotificationSchema } from './persistence/entities/email-notification.entity';
import { helpArticleSchema } from './persistence/entities/help-article.entity';
import { inquirySchema } from './persistence/entities/inquiry.entity';
import { policySchema } from './persistence/entities/policy.entity';
import { profileSchema } from './persistence/entities/profile.entity';
import { reportSchema } from './persistence/entities/report.entity';
import { snsLinkSchema } from './persistence/entities/sns-link.entity';
import { suspensionSchema } from './persistence/entities/suspension.entity';
import { unfreezeRequestSchema } from './persistence/entities/unfreeze-request.entity';
import { userSchema } from './persistence/entities/user.entity';

export const ENTITIES = [
	userSchema,
	profileSchema,
	snsLinkSchema,
	// 管理者コンソール(07)・Trust&Safety(06)・公開 API キー運用(05)向け。
	adminAccountSchema,
	adminWebauthnCredentialSchema,
	auditLogSchema,
	suspensionSchema,
	unfreezeRequestSchema,
	reportSchema,
	apiKeySchema,
	appSettingSchema,
	// §08 コンテンツ&コミュニケーション(08-content-and-comms)。
	announcementSchema,
	emailNotificationSchema,
	helpArticleSchema,
	inquirySchema,
	policySchema
];

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
	debug: false,
	// マイグレーションの正本は MikroORM Migrator（db/02-migrations.md §1）。
	// 生成した SQL は scripts/export-wrangler-migration.ts で wrangler d1 migrations 形式へ書き出す。
	extensions: [Migrator],
	migrations: {
		path: './migrations',
		pathTs: './migrations',
		tableName: 'mikro_orm_migrations',
		transactional: true,
		emit: 'ts' as const,
		// テスト/コマンド実行のたびに一意な一時DBパスへ接続するため、dbName単位のスナップショット
		// JSONがmigrationsディレクトリに蓄積してしまう。実DBへの直接イントロスペクションで足りるため無効化する。
		snapshot: false
	}
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

// MikroORM CLI / スタンドアロン用途のデフォルトエクスポート(ローカル/dev)。
export default buildMikroOrmConfig(resolveDbName(process.env.DATABASE_URL));
