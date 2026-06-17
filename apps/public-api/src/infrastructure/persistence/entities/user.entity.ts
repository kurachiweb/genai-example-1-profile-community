// users テーブルの MikroORM エンティティ(db §5.1)。MikroORM 7 の EntitySchema で定義する
// (v7 はデコレータ API を廃止、ADR 20260617 / coding/06-mikroorm.md)。命名戦略 underscore で物理名は自動対応。
// 永続化エンティティに業務ロジックは持たせない(エンタープライズルールは domain 層、mikroorm §1)。
import { EntitySchema, Opt } from '@mikro-orm/core';
import { UserStatus } from '../../../domain/user-status';

// 既定値/自動付与の列は Opt でマークし、em.create 時に省略可能にする(v7 は OptionalProps の後継)。
export class UserEntity {
	id!: string;
	email!: string;
	emailNormalized!: string;
	passwordHash!: string;
	// UNVERIFIED/ACTIVE/FROZEN/WITHDRAWN(COMMON-2)。アプリ層が状態遷移を担保し、DB は文字列保存。
	status!: UserStatus;
	emailVerifiedAt!: Date | null;
	sessionEpoch!: Opt<number>;
	announcementEmailOptIn!: Opt<boolean>;
	createdAt!: Opt<Date>;
	updatedAt!: Opt<Date>;
}

export const userSchema = new EntitySchema<UserEntity>({
	class: UserEntity,
	tableName: 'users',
	properties: {
		id: { type: 'string', primary: true },
		email: { type: 'string' },
		emailNormalized: { type: 'string', unique: 'uq_users_email_normalized' },
		passwordHash: { type: 'string' },
		status: { type: 'string' },
		emailVerifiedAt: { type: 'datetime', nullable: true },
		sessionEpoch: { type: 'integer', default: 0 },
		announcementEmailOptIn: { type: 'boolean', default: true },
		createdAt: { type: 'datetime', onCreate: () => new Date() },
		updatedAt: { type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date() }
	}
});
