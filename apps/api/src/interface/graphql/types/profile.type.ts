// Profile の GraphQL 出力型(Interface Adapters / ViewModel)。
// 公開識別子はハンドルであり、内部 ULID(id)は @Field を付けず schema へ露出しない(db §4・BR-SHARE-006)。
// snsLinks の解決に内部 id を使うため、ランタイムのオブジェクトには id を保持する。
import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { SnsLinkType } from './sns-link.type';

@ObjectType('Profile')
export class ProfileType {
	/** 内部 ULID。schema には露出しない(snsLinks フィールドリゾルバの引き当てキー)。 */
	id!: string;

	@Field(() => String)
	handle!: string;

	/** 表示名(firstName/lastName + 表示順から導出、BR-PROF-003)。 */
	@Field(() => String)
	displayName!: string;

	@Field(() => String)
	firstName!: string;

	@Field(() => String)
	lastName!: string;

	@Field(() => String)
	nameDisplayOrder!: string;

	@Field(() => String)
	visibility!: string;

	@Field(() => String, { nullable: true })
	iconImageId!: string | null;

	@Field(() => String, { nullable: true })
	occupation!: string | null;

	@Field(() => String, { nullable: true })
	bio!: string | null;

	// snsLinks は ResolveField + DataLoader で解決する(N+1 回避)。
	@Field(() => [SnsLinkType])
	snsLinks?: SnsLinkType[];

	@Field(() => GraphQLISODateTime)
	createdAt!: Date;

	@Field(() => GraphQLISODateTime)
	updatedAt!: Date;
}
