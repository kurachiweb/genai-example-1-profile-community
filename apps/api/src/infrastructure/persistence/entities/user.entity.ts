// users テーブルの MikroORM エンティティ(db §5.1)。命名戦略 underscore で物理名は自動対応。
// 永続化エンティティに業務ロジックは持たせない(エンタープライズルールは domain 層、mikroorm §1)。
import { Entity, OptionalProps, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { UserStatus } from '../../../domain/user-status';

@Entity({ tableName: 'users' })
export class UserEntity {
	// 既定値/初期化子を持つ列は create 時に省略可能(MikroORM の型上の宣言)。
	[OptionalProps]?:
		| 'emailVerifiedAt'
		| 'sessionEpoch'
		| 'announcementEmailOptIn'
		| 'createdAt'
		| 'updatedAt';

	@PrimaryKey({ type: 'string' })
	id!: string;

	@Property({ type: 'string' })
	email!: string;

	@Property({ type: 'string' })
	@Unique({ name: 'uq_users_email_normalized' })
	emailNormalized!: string;

	@Property({ type: 'string' })
	passwordHash!: string;

	// UNVERIFIED/ACTIVE/FROZEN/WITHDRAWN(COMMON-2)。アプリ層が状態遷移を担保し、DB は文字列保存。
	@Property({ type: 'string' })
	status!: UserStatus;

	@Property({ type: 'datetime', nullable: true })
	emailVerifiedAt: Date | null = null;

	@Property({ type: 'integer', default: 0 })
	sessionEpoch = 0;

	@Property({ type: 'boolean', default: true })
	announcementEmailOptIn = true;

	@Property({ type: 'datetime' })
	createdAt: Date = new Date();

	@Property({ type: 'datetime', onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
