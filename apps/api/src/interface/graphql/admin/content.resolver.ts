// §08 コンテンツ系 GraphQL リゾルバ。薄く保ち、入出力変換とユースケース呼び出しに徹する。
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
	AnnouncementImportance,
	EmailTargetCondition,
	HelpArticleStatus,
	InquiryStatus,
	PolicyType
} from '../../../domain/content';
import { EMAIL_TEMPLATES } from '../../../domain/email-templates';
import { AnnouncementService } from '../../../application/admin/announcement.service';
import { EmailNotificationService } from '../../../application/admin/email-notification.service';
import { HelpArticleService } from '../../../application/admin/help-article.service';
import { InquiryService } from '../../../application/admin/inquiry.service';
import { PolicyService } from '../../../application/admin/policy.service';
import {
	AnnouncementRecord,
	EmailNotificationRecord,
	HelpArticleRecord,
	InquiryRecord,
	PolicyRecord
} from '../../../application/admin/content-models';
import { AdminContextProvider, RequestLike } from './admin-context.provider';
import {
	AnnouncementInputType,
	EmailNotificationInputType,
	HelpArticleInputType,
	InquiriesArgs,
	PoliciesArgs,
	PolicyVersionInputType
} from './content-inputs';
import {
	AnnouncementType,
	EmailNotificationType,
	EmailSendResultType,
	EmailTemplateType,
	HelpArticleType,
	InquiryType,
	PolicyType as PolicyObjectType
} from './content-types';

interface GraphQLContext {
	readonly req?: RequestLike;
}

function toDate(value?: string | null): Date | null {
	return value ? new Date(value) : null;
}

function presentAnnouncement(record: AnnouncementRecord): AnnouncementType {
	return { ...record };
}
function presentHelp(record: HelpArticleRecord): HelpArticleType {
	return {
		id: record.id,
		title: record.title,
		slug: record.slug,
		category: record.category,
		bodyMarkdown: record.bodyMarkdown,
		status: record.status,
		updatedAt: record.updatedAt
	};
}
function presentPolicy(record: PolicyRecord): PolicyObjectType {
	return { ...record };
}
function presentInquiry(record: InquiryRecord): InquiryType {
	return {
		id: record.id,
		category: record.category,
		subject: record.subject,
		body: record.body,
		contactEmail: record.contactEmail,
		status: record.status,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt
	};
}
function presentEmail(record: EmailNotificationRecord): EmailNotificationType {
	return { ...record };
}

@Resolver()
export class AdminContentResolver {
	constructor(
		private readonly context: AdminContextProvider,
		private readonly announcements: AnnouncementService,
		private readonly help: HelpArticleService,
		private readonly policies: PolicyService,
		private readonly inquiries: InquiryService,
		private readonly emails: EmailNotificationService
	) {}

	// --- お知らせ ---

	@Query(() => [AnnouncementType], { name: 'adminAnnouncements' })
	async adminAnnouncements(@Context() ctx: GraphQLContext): Promise<AnnouncementType[]> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return (await this.announcements.list(principal)).map(presentAnnouncement);
	}

	@Mutation(() => AnnouncementType, { name: 'adminCreateAnnouncement' })
	async adminCreateAnnouncement(
		@Args('input') input: AnnouncementInputType,
		@Context() ctx: GraphQLContext
	): Promise<AnnouncementType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return presentAnnouncement(
			await this.announcements.create(principal, {
				title: input.title,
				bodyMarkdown: input.bodyMarkdown,
				importance: input.importance as AnnouncementImportance | undefined,
				publishStartAt: toDate(input.publishStartAt),
				publishEndAt: toDate(input.publishEndAt)
			})
		);
	}

	@Mutation(() => AnnouncementType, { name: 'adminUpdateAnnouncement' })
	async adminUpdateAnnouncement(
		@Args('id') id: string,
		@Args('input') input: AnnouncementInputType,
		@Context() ctx: GraphQLContext
	): Promise<AnnouncementType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return presentAnnouncement(
			await this.announcements.update(principal, id, {
				title: input.title,
				bodyMarkdown: input.bodyMarkdown,
				importance: input.importance as AnnouncementImportance | undefined,
				publishStartAt: toDate(input.publishStartAt),
				publishEndAt: toDate(input.publishEndAt)
			})
		);
	}

	@Mutation(() => AnnouncementType, { name: 'adminPublishAnnouncement' })
	async adminPublishAnnouncement(
		@Args('id') id: string,
		@Context() ctx: GraphQLContext
	): Promise<AnnouncementType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return presentAnnouncement(await this.announcements.publish(principal, id));
	}

	@Mutation(() => AnnouncementType, { name: 'adminUnpublishAnnouncement' })
	async adminUnpublishAnnouncement(
		@Args('id') id: string,
		@Context() ctx: GraphQLContext
	): Promise<AnnouncementType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return presentAnnouncement(await this.announcements.unpublish(principal, id));
	}

	@Mutation(() => Boolean, { name: 'adminDeleteAnnouncement' })
	async adminDeleteAnnouncement(
		@Args('id') id: string,
		@Context() ctx: GraphQLContext
	): Promise<boolean> {
		const principal = await this.context.requirePrincipal(ctx.req);
		await this.announcements.remove(principal, id);
		return true;
	}

	// --- ヘルプ記事 ---

	@Query(() => [HelpArticleType], { name: 'adminHelpArticles' })
	async adminHelpArticles(@Context() ctx: GraphQLContext): Promise<HelpArticleType[]> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return (await this.help.list(principal)).map(presentHelp);
	}

	@Mutation(() => HelpArticleType, { name: 'adminUpsertHelpArticle' })
	async adminUpsertHelpArticle(
		@Args('input') input: HelpArticleInputType,
		@Context() ctx: GraphQLContext
	): Promise<HelpArticleType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return presentHelp(
			await this.help.upsert(principal, {
				id: input.id,
				title: input.title,
				slug: input.slug,
				category: input.category ?? null,
				bodyMarkdown: input.bodyMarkdown,
				status: input.status as HelpArticleStatus | undefined
			})
		);
	}

	@Mutation(() => HelpArticleType, { name: 'adminSetHelpArticleStatus' })
	async adminSetHelpArticleStatus(
		@Args('id') id: string,
		@Args('status') status: string,
		@Context() ctx: GraphQLContext
	): Promise<HelpArticleType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return presentHelp(await this.help.setStatus(principal, id, status as HelpArticleStatus));
	}

	// --- 規約 ---

	@Query(() => [PolicyObjectType], { name: 'adminPolicies' })
	async adminPolicies(
		@Args() args: PoliciesArgs,
		@Context() ctx: GraphQLContext
	): Promise<PolicyObjectType[]> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return (await this.policies.listByType(principal, args.type as PolicyType)).map(presentPolicy);
	}

	@Mutation(() => PolicyObjectType, { name: 'adminCreatePolicyVersion' })
	async adminCreatePolicyVersion(
		@Args('input') input: PolicyVersionInputType,
		@Context() ctx: GraphQLContext
	): Promise<PolicyObjectType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return presentPolicy(
			await this.policies.createVersion(principal, {
				type: input.type as PolicyType,
				bodyMarkdown: input.bodyMarkdown,
				requiresReconsent: input.requiresReconsent,
				effectiveDate: new Date(input.effectiveDate)
			})
		);
	}

	@Mutation(() => PolicyObjectType, { name: 'adminPublishPolicy' })
	async adminPublishPolicy(
		@Args('id') id: string,
		@Context() ctx: GraphQLContext
	): Promise<PolicyObjectType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return presentPolicy(await this.policies.publish(principal, id));
	}

	// --- 問い合わせ ---

	@Query(() => [InquiryType], { name: 'adminInquiries' })
	async adminInquiries(
		@Args() args: InquiriesArgs,
		@Context() ctx: GraphQLContext
	): Promise<InquiryType[]> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return (
			await this.inquiries.list(principal, {
				status: args.status as InquiryStatus | undefined,
				category: args.category
			})
		).map(presentInquiry);
	}

	@Mutation(() => InquiryType, { name: 'adminUpdateInquiryStatus' })
	async adminUpdateInquiryStatus(
		@Args('id') id: string,
		@Args('status') status: string,
		@Context() ctx: GraphQLContext
	): Promise<InquiryType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return presentInquiry(
			await this.inquiries.updateStatus(principal, id, status as InquiryStatus)
		);
	}

	// --- メール通知 ---

	@Query(() => [EmailNotificationType], { name: 'adminEmailNotifications' })
	async adminEmailNotifications(@Context() ctx: GraphQLContext): Promise<EmailNotificationType[]> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return (await this.emails.list(principal)).map(presentEmail);
	}

	@Query(() => [EmailTemplateType], { name: 'adminEmailTemplates' })
	async adminEmailTemplates(@Context() ctx: GraphQLContext): Promise<EmailTemplateType[]> {
		await this.context.requirePrincipal(ctx.req);
		return EMAIL_TEMPLATES.map((template) => ({ ...template }));
	}

	@Mutation(() => EmailNotificationType, { name: 'adminCreateEmailNotification' })
	async adminCreateEmailNotification(
		@Args('input') input: EmailNotificationInputType,
		@Context() ctx: GraphQLContext
	): Promise<EmailNotificationType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return presentEmail(
			await this.emails.createDraft(principal, {
				subject: input.subject,
				templateKey: input.templateKey,
				targetCondition: input.targetCondition as EmailTargetCondition
			})
		);
	}

	@Mutation(() => Boolean, { name: 'adminTestSendEmail' })
	async adminTestSendEmail(
		@Args('id') id: string,
		@Args('toEmail') toEmail: string,
		@Context() ctx: GraphQLContext
	): Promise<boolean> {
		const principal = await this.context.requirePrincipal(ctx.req);
		await this.emails.testSend(principal, id, toEmail);
		return true;
	}

	@Mutation(() => EmailSendResultType, { name: 'adminSendEmailNotification' })
	async adminSendEmailNotification(
		@Args('id') id: string,
		@Context() ctx: GraphQLContext
	): Promise<EmailSendResultType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return this.emails.send(principal, id);
	}
}
