// sns_links テーブルの MikroORM エンティティ(db §5.3)。Profile に 0〜10 件紐づく。MikroORM 7 の EntitySchema。
import { EntitySchema, Opt } from '@mikro-orm/core';
import { SnsPlatform } from '../../../domain/sns-link';
import { ProfileEntity } from './profile.entity';

export class SnsLinkEntity {
	id!: string;
	profile!: ProfileEntity;
	platform!: SnsPlatform;
	url!: string;
	label!: string | null;
	sortOrder!: Opt<number>;
	createdAt!: Opt<Date>;
}

export const snsLinkSchema = new EntitySchema<SnsLinkEntity>({
	class: SnsLinkEntity,
	tableName: 'sns_links',
	// リンクの順序付き取得(db §6)。
	indexes: [{ name: 'idx_sns_links_profile_sort', properties: ['profile', 'sortOrder'] }],
	properties: {
		id: { type: 'string', primary: true },
		profile: {
			kind: 'm:1',
			entity: () => ProfileEntity,
			deleteRule: 'cascade',
			updateRule: 'cascade'
		},
		platform: { type: 'string' },
		url: { type: 'string' },
		label: { type: 'string', nullable: true },
		sortOrder: { type: 'integer', default: 0 },
		createdAt: { type: 'datetime', onCreate: () => new Date() }
	}
});
