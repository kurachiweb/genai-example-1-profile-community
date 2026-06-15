// MikroORM 設定(Frameworks & Drivers)。ローカルは SQLite、本番は D1(SQLite 互換・同一スキーマ)。
// ドライバ差は本層で吸収し、Entities/Use Cases に持ち込まない(mikroorm §8)。
import { ReflectMetadataProvider, UnderscoreNamingStrategy } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/sqlite';
import { ProfileEntity } from './persistence/entities/profile.entity';
import { SnsLinkEntity } from './persistence/entities/sns-link.entity';
import { UserEntity } from './persistence/entities/user.entity';

export const ENTITIES = [UserEntity, ProfileEntity, SnsLinkEntity];

/** DATABASE_URL(`file:/path` 形式)または `:memory:` から SQLite のパスを解決する。 */
export function resolveDbName(databaseUrl?: string): string {
	if (!databaseUrl || databaseUrl === ':memory:') {
		return ':memory:';
	}
	return databaseUrl.startsWith('file:') ? databaseUrl.slice('file:'.length) : databaseUrl;
}

export function buildMikroOrmConfig(dbName: string) {
	return defineConfig({
		dbName,
		entities: ENTITIES,
		// TypeScript デコレータのメタデータから定義を読む(ts-morph 不要、mikroorm)。
		metadataProvider: ReflectMetadataProvider,
		// TS camelCase ↔ DB snake_case(db/00-overview §3)。
		namingStrategy: UnderscoreNamingStrategy,
		// 時刻は UTC 保存・読み出し(BR-COMMON-015)。
		forceUtcTimezone: true,
		// 各操作で em.fork() するため、グローバル EM の利用を許容する(リクエスト混線は fork で回避)。
		allowGlobalContext: true,
		debug: false
	});
}

// MikroORM CLI / スタンドアロン用途のデフォルトエクスポート。
export default buildMikroOrmConfig(resolveDbName(process.env.DATABASE_URL));
