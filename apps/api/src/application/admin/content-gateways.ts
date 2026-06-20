// §08 コンテンツ&コミュニケーションの Gateway(インターフェース)。実装は Interface Adapters/Frameworks 側。
import { EmailTargetCondition, InquiryStatus, PolicyType } from '../../domain/content';
import {
	AnnouncementRecord,
	EmailNotificationRecord,
	HelpArticleRecord,
	InquiryRecord,
	PolicyRecord
} from './content-models';

export const ANNOUNCEMENT_REPOSITORY = Symbol('AnnouncementRepository');

export interface AnnouncementRepository {
	list(): Promise<AnnouncementRecord[]>;
	findById(id: string): Promise<AnnouncementRecord | null>;
	save(record: AnnouncementRecord): Promise<void>;
	delete(id: string): Promise<void>;
}

export const HELP_ARTICLE_REPOSITORY = Symbol('HelpArticleRepository');

export interface HelpArticleRepository {
	list(): Promise<HelpArticleRecord[]>;
	findById(id: string): Promise<HelpArticleRecord | null>;
	findBySlug(slug: string): Promise<HelpArticleRecord | null>;
	save(record: HelpArticleRecord): Promise<void>;
}

export const POLICY_REPOSITORY = Symbol('PolicyRepository');

export interface PolicyRepository {
	listByType(type: PolicyType): Promise<PolicyRecord[]>;
	findById(id: string): Promise<PolicyRecord | null>;
	maxVersion(type: PolicyType): Promise<number>;
	save(record: PolicyRecord): Promise<void>;
	/** 当該版を発効中にし、同 type の他版を発効解除する(公開中は 1 版のみ、BR-CONTENT-008)。 */
	publish(id: string, type: PolicyType): Promise<void>;
}

export const INQUIRY_REPOSITORY = Symbol('InquiryRepository');

export interface InquiryRepository {
	list(filter: { status?: InquiryStatus; category?: string }): Promise<InquiryRecord[]>;
	findById(id: string): Promise<InquiryRecord | null>;
	setStatus(id: string, status: InquiryStatus, updatedAt: Date): Promise<void>;
}

export const EMAIL_NOTIFICATION_REPOSITORY = Symbol('EmailNotificationRepository');

export interface EmailNotificationRepository {
	list(): Promise<EmailNotificationRecord[]>;
	findById(id: string): Promise<EmailNotificationRecord | null>;
	save(record: EmailNotificationRecord): Promise<void>;
}

export const EMAIL_RECIPIENT_REPOSITORY = Symbol('EmailRecipientRepository');

export interface EmailRecipientRepository {
	/** お知らせ系メールの受信対象メール一覧(opt-in かつ条件、BR-CONTENT-003/004)。 */
	listRecipientEmails(condition: EmailTargetCondition): Promise<string[]>;
}

export const MAIL_SENDER = Symbol('MailSender');

export interface MailMessage {
	readonly to: string;
	readonly subject: string;
	readonly html: string;
}

export interface MailSender {
	send(message: MailMessage): Promise<void>;
}
