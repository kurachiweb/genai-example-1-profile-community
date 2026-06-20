// §08 コンテンツ系の型(api の GraphQL に対応)。
export interface Announcement {
	readonly id: string;
	readonly title: string;
	readonly bodyMarkdown: string;
	readonly status: string;
	readonly importance: string;
	readonly publishStartAt: string | null;
	readonly publishEndAt: string | null;
	readonly createdAt: string;
	readonly updatedAt: string;
}

export interface HelpArticle {
	readonly id: string;
	readonly title: string;
	readonly slug: string;
	readonly category: string | null;
	readonly bodyMarkdown: string;
	readonly status: string;
	readonly updatedAt: string;
}

export interface Policy {
	readonly id: string;
	readonly type: string;
	readonly version: number;
	readonly bodyMarkdown: string;
	readonly isPublished: boolean;
	readonly requiresReconsent: boolean;
	readonly effectiveDate: string;
	readonly createdAt: string;
}

export interface Inquiry {
	readonly id: string;
	readonly category: string;
	readonly subject: string | null;
	readonly body: string;
	readonly contactEmail: string | null;
	readonly status: string;
	readonly createdAt: string;
	readonly updatedAt: string;
}

export interface EmailNotification {
	readonly id: string;
	readonly subject: string;
	readonly templateKey: string;
	readonly targetCondition: string;
	readonly status: string;
	readonly sentAt: string | null;
	readonly createdAt: string;
}

export interface EmailTemplate {
	readonly key: string;
	readonly label: string;
}
