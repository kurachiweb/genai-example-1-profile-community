// api_keys テーブル(db §5.4)。管理者の運用監視(メタ閲覧・失効)向けに api 側でも参照する。
// 秘匿値は保存せずハッシュのみ(BR-API-001)。発行 UI は別ユニットだが、本エンティティは運用監視に必要。
import { EntitySchema, Opt } from '@mikro-orm/core';

export class ApiKeyEntity {
	id!: string;
	userId!: string;
	keyHash!: string;
	label!: string | null;
	scope!: string;
	status!: Opt<string>;
	lastUsedAt!: Date | null;
	createdAt!: Opt<Date>;
	revokedAt!: Date | null;
}

export const apiKeySchema = new EntitySchema<ApiKeyEntity>({
	class: ApiKeyEntity,
	tableName: 'api_keys',
	indexes: [{ name: 'idx_api_keys_user_status', properties: ['userId', 'status'] }],
	properties: {
		id: { type: 'string', primary: true },
		userId: { type: 'string' },
		keyHash: { type: 'string', unique: 'uq_api_keys_key_hash' },
		label: { type: 'string', nullable: true },
		scope: { type: 'string' },
		status: { type: 'string', default: 'active' },
		lastUsedAt: { type: 'datetime', nullable: true },
		createdAt: { type: 'datetime', onCreate: () => new Date() },
		revokedAt: { type: 'datetime', nullable: true }
	}
});
