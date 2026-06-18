// api_keys テーブルの MikroORM エンティティ(db §5.4)。User に 0〜5 件(有効)紐づく。MikroORM 7 の EntitySchema。
// キー値は保存せず、ハッシュのみを一意保存する(BR-API-001)。スコープは発行時固定(BR-API-001b)。
import { EntitySchema, Opt } from '@mikro-orm/core';
import { ApiKeyScope, ApiKeyStatus } from '../../../domain/api-key';
import { UserEntity } from './user.entity';

export class ApiKeyEntity {
	id!: string;
	user!: UserEntity;
	// キー認証の引き当て(uq_api_keys_key_hash、db §6)。秘匿値は保存しない(BR-API-001)。
	keyHash!: string;
	label!: string | null;
	// read/full。発行時に選択し変更不可(BR-API-001b)。アプリ層が enum を担保し DB は文字列保存。
	scope!: ApiKeyScope;
	// active/revoked。失効後は認証に使えない(BR-API-003)。
	status!: Opt<ApiKeyStatus>;
	lastUsedAt!: Date | null;
	createdAt!: Opt<Date>;
	revokedAt!: Date | null;
}

export const apiKeySchema = new EntitySchema<ApiKeyEntity>({
	class: ApiKeyEntity,
	tableName: 'api_keys',
	// 有効キー数の判定(上限 5)・ユーザー別の絞り込み(db §6)。
	indexes: [{ name: 'idx_api_keys_user_status', properties: ['user', 'status'] }],
	properties: {
		id: { type: 'string', primary: true },
		user: {
			kind: 'm:1',
			entity: () => UserEntity,
			deleteRule: 'cascade',
			updateRule: 'cascade'
		},
		keyHash: { type: 'string', unique: 'uq_api_keys_key_hash' },
		label: { type: 'string', nullable: true },
		scope: { type: 'string' },
		status: { type: 'string', default: ApiKeyStatus.ACTIVE },
		lastUsedAt: { type: 'datetime', nullable: true },
		createdAt: { type: 'datetime', onCreate: () => new Date() },
		revokedAt: { type: 'datetime', nullable: true }
	}
});
