// ヘルプ記事の公開閲覧 GraphQL 出力/引数型(BR-CONTENT-005)。ログイン不要。
import { ArgsType, Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@ObjectType('HelpArticle')
export class HelpArticleType {
	@Field(() => String) title!: string;
	@Field(() => String) slug!: string;
	@Field(() => String, { nullable: true }) category!: string | null;
	@Field(() => String) bodyMarkdown!: string;
	@Field(() => GraphQLISODateTime) updatedAt!: Date;
}

@ArgsType()
export class PublicHelpArticleSlugArgs {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	slug!: string;
}
