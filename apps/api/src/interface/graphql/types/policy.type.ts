// 規約・プライバシーポリシーの公開閲覧 GraphQL 出力/引数型(BR-CONTENT-010)。ログイン不要。
import { ArgsType, Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { IsIn, IsInt, Min } from 'class-validator';
import { PolicyType as PolicyTypeEnum } from '../../../domain/content';

@ObjectType('Policy')
export class PolicyType {
	@Field(() => String) type!: string;
	@Field(() => Int) version!: number;
	@Field(() => String) bodyMarkdown!: string;
	@Field(() => Boolean) isPublished!: boolean;
	@Field(() => Boolean) requiresReconsent!: boolean;
	@Field(() => GraphQLISODateTime) effectiveDate!: Date;
}

@ArgsType()
export class PublicPolicyArgs {
	@Field(() => String)
	@IsIn([PolicyTypeEnum.TERMS, PolicyTypeEnum.PRIVACY])
	type!: string;
}

@ArgsType()
export class PublicPolicyVersionArgs extends PublicPolicyArgs {
	@Field(() => Int)
	@IsInt()
	@Min(1)
	version!: number;
}
