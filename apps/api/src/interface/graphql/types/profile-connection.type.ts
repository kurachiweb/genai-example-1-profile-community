// カーソル接続(Relay 風)。一覧/検索は Connection で表現する(api/01-graphql-internal.md §3)。
import { Field, ObjectType } from '@nestjs/graphql';
import { ProfileType } from './profile.type';

@ObjectType('PageInfo')
export class PageInfoType {
	@Field(() => Boolean)
	hasNextPage!: boolean;

	@Field(() => String, { nullable: true })
	endCursor!: string | null;
}

@ObjectType('ProfileEdge')
export class ProfileEdgeType {
	@Field(() => ProfileType)
	node!: ProfileType;

	// 不透明カーソル(消費側で構造を解釈させない、api §3)。
	@Field(() => String)
	cursor!: string;
}

@ObjectType('ProfileConnection')
export class ProfileConnectionType {
	@Field(() => [ProfileEdgeType])
	edges!: ProfileEdgeType[];

	@Field(() => PageInfoType)
	pageInfo!: PageInfoType;
}
