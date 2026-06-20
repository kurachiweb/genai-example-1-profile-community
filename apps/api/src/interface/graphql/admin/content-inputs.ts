// §08 コンテンツ系の Input/Args 型。class-validator で形を境界検証する(業務ルールはユースケース)。
import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { EmailTargetCondition, InquiryStatus, PolicyType } from '../../../domain/content';

@InputType()
export class AnnouncementInputType {
	@Field(() => String)
	@IsString()
	@MaxLength(120)
	title!: string;

	@Field(() => String)
	@IsString()
	@MaxLength(20000)
	bodyMarkdown!: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsIn(['normal', 'important'])
	importance?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	publishStartAt?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	publishEndAt?: string;
}

@InputType()
export class HelpArticleInputType {
	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	id?: string;

	@Field(() => String)
	@IsString()
	@MaxLength(120)
	title!: string;

	@Field(() => String)
	@IsString()
	@MaxLength(80)
	slug!: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	@MaxLength(60)
	category?: string;

	@Field(() => String)
	@IsString()
	@MaxLength(40000)
	bodyMarkdown!: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsIn(['published', 'unpublished'])
	status?: string;
}

@InputType()
export class PolicyVersionInputType {
	@Field(() => String)
	@IsIn([PolicyType.TERMS, PolicyType.PRIVACY])
	type!: string;

	@Field(() => String)
	@IsString()
	@MaxLength(100000)
	bodyMarkdown!: string;

	@Field(() => Boolean)
	@IsBoolean()
	requiresReconsent!: boolean;

	@Field(() => String)
	@IsString()
	effectiveDate!: string;
}

@InputType()
export class EmailNotificationInputType {
	@Field(() => String)
	@IsString()
	@MaxLength(200)
	subject!: string;

	@Field(() => String)
	@IsString()
	templateKey!: string;

	@Field(() => String)
	@IsIn([EmailTargetCondition.ALL, EmailTargetCondition.VERIFIED])
	targetCondition!: string;
}

@ArgsType()
export class PoliciesArgs {
	@Field(() => String)
	@IsIn([PolicyType.TERMS, PolicyType.PRIVACY])
	type!: string;
}

@ArgsType()
export class InquiriesArgs {
	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsIn([InquiryStatus.OPEN, InquiryStatus.IN_PROGRESS, InquiryStatus.CLOSED])
	status?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsIn(['general', 'report', 'unfreeze'])
	category?: string;
}
