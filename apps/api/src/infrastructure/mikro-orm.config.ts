// MikroORM 設定(Frameworks & Drivers)。ローカルは SQLite、本番は D1(SQLite 互換・同一スキーマ)。
// ドライバ差は本層で吸収し、Entities/Use Cases に持ち込まない(mikroorm §8)。
// MikroORM 7 は EntitySchema でメタデータを明示するため reflect メタデータプロバイダは不要(ADR 20260617)。
import { UnderscoreNamingStrategy } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/sqlite';
import { adminAccountSchema } from './persistence/entities/admin-account.entity';
import { adminWebauthnCredentialSchema } from './persistence/entities/admin-webauthn-credential.entity';
import { apiKeySchema } from './persistence/entities/api-key.entity';
import { appSettingSchema } from './persistence/entities/app-setting.entity';
import { auditLogSchema } from './persistence/entities/audit-log.entity';
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
	appSettingSchema
];

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
