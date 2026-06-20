// §08 コンテンツ&コミュニケーションの中立データ構造。
import {
	AnnouncementImportance,
	AnnouncementStatus,
	EmailNotificationStatus,
	EmailTargetCondition,
	HelpArticleStatus,
	InquiryCategory,
	InquiryStatus,
	PolicyType
} from '../../domain/content';

export interface AnnouncementRecord {
	readonly id: string;
	readonly title: string;
	readonly bodyMarkdown: string;
	readonly status: AnnouncementStatus;
	readonly importance: AnnouncementImportance;
	readonly publishStartAt: Date | null;
	readonly publishEndAt: Date | null;
	readonly createdBy: string;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export interface HelpArticleRecord {
	readonly id: string;
	readonly title: string;
	readonly slug: string;
	readonly category: string | null;
	readonly bodyMarkdown: string;
	readonly status: HelpArticleStatus;
	readonly updatedBy: string;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export interface PolicyRecord {
	readonly id: string;
	readonly type: PolicyType;
	readonly version: number;
	readonly bodyMarkdown: string;
	readonly isPublished: boolean;
	readonly requiresReconsent: boolean;
	readonly effectiveDate: Date;
	readonly editedBy: string;
	readonly createdAt: Date;
}

export interface InquiryRecord {
	readonly id: string;
	readonly category: InquiryCategory;
	readonly subject: string | null;
	readonly body: string;
	readonly contactEmail: string | null;
	readonly status: InquiryStatus;
	readonly createdByUserId: string | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export interface EmailNotificationRecord {
	readonly id: string;
	readonly subject: string;
	readonly templateKey: string;
	readonly targetCondition: EmailTargetCondition;
	readonly status: EmailNotificationStatus;
	readonly createdBy: string;
	readonly sentAt: Date | null;
	readonly createdAt: Date;
}

export interface EmailSendResult {
	readonly recipientCount: number;
}
