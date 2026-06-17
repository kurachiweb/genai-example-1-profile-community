// profiles テーブルの MikroORM エンティティ(db §5.2)。User と 1:1。MikroORM 7 の EntitySchema で定義する。
import { EntitySchema, Opt } from '@mikro-orm/core';
import { NameDisplayOrder } from '../../../domain/display-name';
import { Visibility } from '../../../domain/effective-public';
import { UserEntity } from './user.entity';

// 既定値/自動付与の列は Opt でマークし、em.create 時に省略可能にする。
export class ProfileEntity {
	id!: string;
	// 1:1(BR-COMMON-006)。所有ユーザー削除時はカスケード。
	user!: UserEntity;
	handle!: string;
	// public/private(BR-SHARE-005)。既定 public(BR-COMMON-006)。
	visibility!: Opt<Visibility>;
	iconImageId!: string | null;
	firstName!: Opt<string>;
	lastName!: Opt<string>;
	nameDisplayOrder!: Opt<NameDisplayOrder>;
	occupation!: string | null;
	// 検索用の導出値(NFC・ケースフォールド、BR-DISC-004)。アプリ層で保守。
	searchName!: string | null;
	bio!: string | null;
	createdAt!: Opt<Date>;
	updatedAt!: Opt<Date>;
}

export const profileSchema = new EntitySchema<ProfileEntity>({
	class: ProfileEntity,
	tableName: 'profiles',
	// 一覧(実効公開・新着順)＋カーソルページング・検索を支える(db §6)。
	indexes: [
		{ name: 'idx_profiles_visibility_updated', properties: ['visibility', 'updatedAt'] },
		{ name: 'idx_profiles_occupation', properties: ['occupation'] },
		{ name: 'idx_profiles_search_name', properties: ['searchName'] }
	],
	properties: {
		id: { type: 'string', primary: true },
		user: {
			kind: '1:1',
			entity: () => UserEntity,
			deleteRule: 'cascade',
			updateRule: 'cascade',
			unique: 'uq_profiles_user_id'
		},
		handle: { type: 'string', unique: 'uq_profiles_handle' },
		visibility: { type: 'string', default: Visibility.PUBLIC },
		iconImageId: { type: 'string', nullable: true },
		firstName: { type: 'string', default: '' },
		lastName: { type: 'string', default: '' },
		nameDisplayOrder: { type: 'string', default: NameDisplayOrder.GIVEN_FIRST },
		occupation: { type: 'string', nullable: true },
		searchName: { type: 'string', nullable: true },
		bio: { type: 'text', nullable: true },
		createdAt: { type: 'datetime', onCreate: () => new Date() },
		updatedAt: { type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date() }
	}
});
