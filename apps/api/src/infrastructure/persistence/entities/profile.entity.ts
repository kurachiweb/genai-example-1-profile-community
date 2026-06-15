// profiles テーブルの MikroORM エンティティ(db §5.2)。User と 1:1。
import {
	Entity,
	Index,
	OneToOne,
	OptionalProps,
	PrimaryKey,
	Property,
	Unique
} from '@mikro-orm/core';
import { NameDisplayOrder } from '../../../domain/display-name';
import { Visibility } from '../../../domain/effective-public';
import { UserEntity } from './user.entity';

@Entity({ tableName: 'profiles' })
// 一覧(実効公開・新着順)＋カーソルページングを支える(db §6)。
@Index({ name: 'idx_profiles_visibility_updated', properties: ['visibility', 'updatedAt'] })
@Index({ name: 'idx_profiles_occupation', properties: ['occupation'] })
@Index({ name: 'idx_profiles_search_name', properties: ['searchName'] })
export class ProfileEntity {
	[OptionalProps]?:
		| 'visibility'
		| 'iconImageId'
		| 'firstName'
		| 'lastName'
		| 'nameDisplayOrder'
		| 'occupation'
		| 'searchName'
		| 'bio'
		| 'createdAt'
		| 'updatedAt';

	@PrimaryKey({ type: 'string' })
	id!: string;

	// 1:1(BR-COMMON-006)。所有ユーザー削除時はカスケード。
	@OneToOne(() => UserEntity, { deleteRule: 'cascade', updateRule: 'cascade' })
	@Unique({ name: 'uq_profiles_user_id' })
	user!: UserEntity;

	@Property({ type: 'string' })
	@Unique({ name: 'uq_profiles_handle' })
	handle!: string;

	// public/private(BR-SHARE-005)。既定 public(BR-COMMON-006)。
	@Property({ type: 'string', default: Visibility.PUBLIC })
	visibility: Visibility = Visibility.PUBLIC;

	@Property({ type: 'string', nullable: true })
	iconImageId: string | null = null;

	@Property({ type: 'string' })
	firstName = '';

	@Property({ type: 'string' })
	lastName = '';

	@Property({ type: 'string', default: NameDisplayOrder.GIVEN_FIRST })
	nameDisplayOrder: NameDisplayOrder = NameDisplayOrder.GIVEN_FIRST;

	@Property({ type: 'string', nullable: true })
	occupation: string | null = null;

	// 検索用の導出値(NFC・ケースフォールド、BR-DISC-004)。アプリ層で保守。
	@Property({ type: 'string', nullable: true })
	searchName: string | null = null;

	@Property({ type: 'text', nullable: true })
	bio: string | null = null;

	@Property({ type: 'datetime' })
	createdAt: Date = new Date();

	@Property({ type: 'datetime', onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
