// sns_links テーブルの MikroORM エンティティ(db §5.3)。Profile に 0〜10 件紐づく。
import { Entity, Index, ManyToOne, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';
import { SnsPlatform } from '../../../domain/sns-link';
import { ProfileEntity } from './profile.entity';

@Entity({ tableName: 'sns_links' })
// リンクの順序付き取得(db §6)。
@Index({ name: 'idx_sns_links_profile_sort', properties: ['profile', 'sortOrder'] })
export class SnsLinkEntity {
  [OptionalProps]?: 'label' | 'sortOrder' | 'createdAt';

  @PrimaryKey({ type: 'string' })
  id!: string;

  @ManyToOne(() => ProfileEntity, { deleteRule: 'cascade', updateRule: 'cascade' })
  profile!: ProfileEntity;

  @Property({ type: 'string' })
  platform!: SnsPlatform;

  @Property({ type: 'string' })
  url!: string;

  @Property({ type: 'string', nullable: true })
  label: string | null = null;

  @Property({ type: 'integer' })
  sortOrder = 0;

  @Property({ type: 'datetime' })
  createdAt: Date = new Date();
}
