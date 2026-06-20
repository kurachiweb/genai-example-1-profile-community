// §08 コンテンツ系の型付き GraphQL 操作(BFF サーバー側専用)。
import { graphqlRequest } from './graphql';
import {
	Announcement,
	EmailNotification,
	EmailTemplate,
	HelpArticle,
	Inquiry,
	Policy
} from './content-types';

const ANNOUNCEMENT_FIELDS = `id title bodyMarkdown status importance publishStartAt publishEndAt createdAt updatedAt`;
const HELP_FIELDS = `id title slug category bodyMarkdown status updatedAt`;
const POLICY_FIELDS = `id type version bodyMarkdown isPublished requiresReconsent effectiveDate createdAt`;
const INQUIRY_FIELDS = `id category subject body contactEmail status createdAt updatedAt`;
const EMAIL_FIELDS = `id subject templateKey targetCondition status sentAt createdAt`;

// --- お知らせ ---
export async function listAnnouncements(): Promise<Announcement[]> {
	const data = await graphqlRequest<{ adminAnnouncements: Announcement[] }>(
		`query{ adminAnnouncements{ ${ANNOUNCEMENT_FIELDS} } }`
	);
	return data.adminAnnouncements;
}
export interface AnnouncementInput {
	title: string;
	bodyMarkdown: string;
	importance?: string;
	publishStartAt?: string;
	publishEndAt?: string;
}
export async function createAnnouncement(input: AnnouncementInput): Promise<void> {
	await graphqlRequest(
		`mutation($input:AnnouncementInputType!){ adminCreateAnnouncement(input:$input){ id } }`,
		{ input }
	);
}
export async function updateAnnouncement(id: string, input: AnnouncementInput): Promise<void> {
	await graphqlRequest(
		`mutation($id:String!,$input:AnnouncementInputType!){ adminUpdateAnnouncement(id:$id,input:$input){ id } }`,
		{ id, input }
	);
}
export async function publishAnnouncement(id: string): Promise<void> {
	await graphqlRequest(`mutation($id:String!){ adminPublishAnnouncement(id:$id){ id } }`, { id });
}
export async function unpublishAnnouncement(id: string): Promise<void> {
	await graphqlRequest(`mutation($id:String!){ adminUnpublishAnnouncement(id:$id){ id } }`, { id });
}
export async function deleteAnnouncement(id: string): Promise<void> {
	await graphqlRequest(`mutation($id:String!){ adminDeleteAnnouncement(id:$id) }`, { id });
}

// --- ヘルプ記事 ---
export async function listHelpArticles(): Promise<HelpArticle[]> {
	const data = await graphqlRequest<{ adminHelpArticles: HelpArticle[] }>(
		`query{ adminHelpArticles{ ${HELP_FIELDS} } }`
	);
	return data.adminHelpArticles;
}
export interface HelpArticleInput {
	id?: string;
	title: string;
	slug: string;
	category?: string;
	bodyMarkdown: string;
	status?: string;
}
export async function upsertHelpArticle(input: HelpArticleInput): Promise<void> {
	await graphqlRequest(
		`mutation($input:HelpArticleInputType!){ adminUpsertHelpArticle(input:$input){ id } }`,
		{ input }
	);
}
export async function setHelpArticleStatus(id: string, status: string): Promise<void> {
	await graphqlRequest(
		`mutation($id:String!,$status:String!){ adminSetHelpArticleStatus(id:$id,status:$status){ id } }`,
		{ id, status }
	);
}

// --- 規約 ---
export async function listPolicies(type: string): Promise<Policy[]> {
	const data = await graphqlRequest<{ adminPolicies: Policy[] }>(
		`query($type:String!){ adminPolicies(type:$type){ ${POLICY_FIELDS} } }`,
		{ type }
	);
	return data.adminPolicies;
}
export interface PolicyVersionInput {
	type: string;
	bodyMarkdown: string;
	requiresReconsent: boolean;
	effectiveDate: string;
}
export async function createPolicyVersion(input: PolicyVersionInput): Promise<void> {
	await graphqlRequest(
		`mutation($input:PolicyVersionInputType!){ adminCreatePolicyVersion(input:$input){ id } }`,
		{ input }
	);
}
export async function publishPolicy(id: string): Promise<void> {
	await graphqlRequest(`mutation($id:String!){ adminPublishPolicy(id:$id){ id } }`, { id });
}

// --- 問い合わせ ---
export async function listInquiries(filter: {
	status?: string;
	category?: string;
}): Promise<Inquiry[]> {
	const data = await graphqlRequest<{ adminInquiries: Inquiry[] }>(
		`query($status:String,$category:String){ adminInquiries(status:$status,category:$category){ ${INQUIRY_FIELDS} } }`,
		filter
	);
	return data.adminInquiries;
}
export async function updateInquiryStatus(id: string, status: string): Promise<void> {
	await graphqlRequest(
		`mutation($id:String!,$status:String!){ adminUpdateInquiryStatus(id:$id,status:$status){ id } }`,
		{ id, status }
	);
}

// --- メール通知 ---
export async function listEmailNotifications(): Promise<EmailNotification[]> {
	const data = await graphqlRequest<{ adminEmailNotifications: EmailNotification[] }>(
		`query{ adminEmailNotifications{ ${EMAIL_FIELDS} } }`
	);
	return data.adminEmailNotifications;
}
export async function listEmailTemplates(): Promise<EmailTemplate[]> {
	const data = await graphqlRequest<{ adminEmailTemplates: EmailTemplate[] }>(
		`query{ adminEmailTemplates{ key label } }`
	);
	return data.adminEmailTemplates;
}
export async function createEmailNotification(input: {
	subject: string;
	templateKey: string;
	targetCondition: string;
}): Promise<void> {
	await graphqlRequest(
		`mutation($input:EmailNotificationInputType!){ adminCreateEmailNotification(input:$input){ id } }`,
		{ input }
	);
}
export async function testSendEmail(id: string, toEmail: string): Promise<void> {
	await graphqlRequest(
		`mutation($id:String!,$toEmail:String!){ adminTestSendEmail(id:$id,toEmail:$toEmail) }`,
		{ id, toEmail }
	);
}
export async function sendEmailNotification(id: string): Promise<number> {
	const data = await graphqlRequest<{ adminSendEmailNotification: { recipientCount: number } }>(
		`mutation($id:String!){ adminSendEmailNotification(id:$id){ recipientCount } }`,
		{ id }
	);
	return data.adminSendEmailNotification.recipientCount;
}
