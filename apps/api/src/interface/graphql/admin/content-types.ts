// §08 コンテンツ系の GraphQL 出力型。
import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('AdminAnnouncement')
export class AnnouncementType {
	@Field(() => String) id!: string;
	@Field(() => String) title!: string;
	@Field(() => String) bodyMarkdown!: string;
	@Field(() => String) status!: string;
	@Field(() => String) importance!: string;
	@Field(() => GraphQLISODateTime, { nullable: true }) publishStartAt!: Date | null;
	@Field(() => GraphQLISODateTime, { nullable: true }) publishEndAt!: Date | null;
	@Field(() => GraphQLISODateTime) createdAt!: Date;
	@Field(() => GraphQLISODateTime) updatedAt!: Date;
}

@ObjectType('AdminHelpArticle')
export class HelpArticleType {
	@Field(() => String) id!: string;
	@Field(() => String) title!: string;
	@Field(() => String) slug!: string;
	@Field(() => String, { nullable: true }) category!: string | null;
	@Field(() => String) bodyMarkdown!: string;
	@Field(() => String) status!: string;
	@Field(() => GraphQLISODateTime) updatedAt!: Date;
}

@ObjectType('AdminPolicy')
export class PolicyType {
	@Field(() => String) id!: string;
	@Field(() => String) type!: string;
	@Field(() => Int) version!: number;
	@Field(() => String) bodyMarkdown!: string;
	@Field(() => Boolean) isPublished!: boolean;
	@Field(() => Boolean) requiresReconsent!: boolean;
	@Field(() => GraphQLISODateTime) effectiveDate!: Date;
	@Field(() => GraphQLISODateTime) createdAt!: Date;
}

@ObjectType('AdminInquiry')
export class InquiryType {
	@Field(() => String) id!: string;
	@Field(() => String) category!: string;
	@Field(() => String, { nullable: true }) subject!: string | null;
	@Field(() => String) body!: string;
	@Field(() => String, { nullable: true }) contactEmail!: string | null;
	@Field(() => String) status!: string;
	@Field(() => GraphQLISODateTime) createdAt!: Date;
	@Field(() => GraphQLISODateTime) updatedAt!: Date;
}

@ObjectType('AdminEmailNotification')
export class EmailNotificationType {
	@Field(() => String) id!: string;
	@Field(() => String) subject!: string;
	@Field(() => String) templateKey!: string;
	@Field(() => String) targetCondition!: string;
	@Field(() => String) status!: string;
	@Field(() => GraphQLISODateTime, { nullable: true }) sentAt!: Date | null;
	@Field(() => GraphQLISODateTime) createdAt!: Date;
}

@ObjectType('AdminEmailTemplate')
export class EmailTemplateType {
	@Field(() => String) key!: string;
	@Field(() => String) label!: string;
}

@ObjectType('AdminEmailSendResult')
export class EmailSendResultType {
	@Field(() => Int) recipientCount!: number;
}
