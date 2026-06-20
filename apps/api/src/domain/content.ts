// コンテンツ&コミュニケーション(お知らせ/メール/ヘルプ/問い合わせ/規約)のドメイン。
// 正本は features/08-content-and-comms.md。状態列挙・遷移・スラッグ/タイトル検証を純粋に表す。
import { ANNOUNCEMENT_TITLE_MAX_GRAPHEMES } from './admin-limits';
import { ValidationError } from './errors';
import { withinGraphemeLimit } from './grapheme';

export const AnnouncementStatus = { DRAFT: 'draft', PUBLISHED: 'published' } as const;
export type AnnouncementStatus = (typeof AnnouncementStatus)[keyof typeof AnnouncementStatus];

export const AnnouncementImportance = { NORMAL: 'normal', IMPORTANT: 'important' } as const;
export type AnnouncementImportance =
	(typeof AnnouncementImportance)[keyof typeof AnnouncementImportance];

export const HelpArticleStatus = { PUBLISHED: 'published', UNPUBLISHED: 'unpublished' } as const;
export type HelpArticleStatus = (typeof HelpArticleStatus)[keyof typeof HelpArticleStatus];

export const PolicyType = { TERMS: 'terms', PRIVACY: 'privacy' } as const;
export type PolicyType = (typeof PolicyType)[keyof typeof PolicyType];

export const EmailNotificationStatus = { DRAFT: 'draft', SENT: 'sent' } as const;
export type EmailNotificationStatus =
	(typeof EmailNotificationStatus)[keyof typeof EmailNotificationStatus];

// お知らせ系メールの配信対象(BR-CONTENT-003)。
export const EmailTargetCondition = { ALL: 'all', VERIFIED: 'verified' } as const;
export type EmailTargetCondition = (typeof EmailTargetCondition)[keyof typeof EmailTargetCondition];

export const InquiryCategory = {
	GENERAL: 'general',
	REPORT: 'report',
	UNFREEZE: 'unfreeze'
} as const;
export type InquiryCategory = (typeof InquiryCategory)[keyof typeof InquiryCategory];

export const InquiryStatus = {
	OPEN: 'OPEN',
	IN_PROGRESS: 'IN_PROGRESS',
	CLOSED: 'CLOSED'
} as const;
export type InquiryStatus = (typeof InquiryStatus)[keyof typeof InquiryStatus];

const INQUIRY_TRANSITIONS: Record<InquiryStatus, readonly InquiryStatus[]> = {
	OPEN: [InquiryStatus.IN_PROGRESS, InquiryStatus.CLOSED],
	IN_PROGRESS: [InquiryStatus.CLOSED, InquiryStatus.OPEN],
	// クローズ後の再開を許容する(誤クローズ・追加対応のため)。
	CLOSED: [InquiryStatus.OPEN]
};

export function canTransitionInquiry(from: InquiryStatus, to: InquiryStatus): boolean {
	return INQUIRY_TRANSITIONS[from].includes(to);
}

export function assertInquiryTransition(from: InquiryStatus, to: InquiryStatus): void {
	if (!canTransitionInquiry(from, to)) {
		throw new ValidationError(`問い合わせの状態 ${from} から ${to} へは遷移できません。`);
	}
}

// スラッグ(ヘルプ記事の公開 URL、db §5.12 一意)。小文字英数とハイフン、連続ハイフン不可。
const SLUG_PATTERN = /^[a-z0-9](?:-?[a-z0-9])*$/;
export const SLUG_MAX_LENGTH = 80;

export function isValidSlug(slug: string): boolean {
	return slug.length >= 1 && slug.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(slug);
}

export function assertValidSlug(slug: string): void {
	if (!isValidSlug(slug)) {
		throw new ValidationError('スラッグは英小文字・数字・ハイフンで指定してください。', [
			{ field: 'slug', message: '使用できない形式です。' }
		]);
	}
}

/** 必須タイトルの検証(空でない・上限以下)。max は features/ の業務値(既定: お知らせ 120)。 */
export function assertValidTitle(
	title: string,
	max: number = ANNOUNCEMENT_TITLE_MAX_GRAPHEMES
): void {
	const trimmed = title.trim();
	if (trimmed.length === 0) {
		throw new ValidationError('タイトルを入力してください。', [
			{ field: 'title', message: '必須項目です。' }
		]);
	}
	if (!withinGraphemeLimit(trimmed, max)) {
		throw new ValidationError('タイトルが長すぎます。', [
			{ field: 'title', message: `${max} 文字以内で入力してください。` }
		]);
	}
}
