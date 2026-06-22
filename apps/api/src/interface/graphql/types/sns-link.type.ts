// SnsLink の GraphQL 出力型(Interface Adapters / ViewModel)。
// client 側は id・displayOrder を参照するため公開フィールドに追加する。
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('SnsLink')
export class SnsLinkType {
	/** 内部 ULID。クライアントが削除時の特定に使う。 */
	@Field(() => String)
	id!: string;

	@Field(() => String)
	platform!: string;

	@Field(() => String)
	url!: string;

	@Field(() => String, { nullable: true })
	label!: string | null;

	/** 表示順(sortOrder の別名)。client 向けに公開する。 */
	@Field(() => Int)
	displayOrder!: number;

	/** 後方互換用(既存 client が sortOrder を参照している場合に備える)。 */
	@Field(() => Int)
	sortOrder!: number;
}
