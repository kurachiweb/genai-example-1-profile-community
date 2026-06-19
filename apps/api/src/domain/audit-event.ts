// 監査ログのイベント語彙とレコード構築(BR-COMMON-013 / BR-ADMIN-010)。
// 追記専用・改ざん不可。秘匿値(パスワード・キー値・Cookie・トークン・チャレンジ)は記録しない(BR-COMMON-014)。

export const AuditActorType = {
	ADMIN: 'admin',
	USER: 'user',
	SYSTEM: 'system'
} as const;

export type AuditActorType = (typeof AuditActorType)[keyof typeof AuditActorType];

export const AuditEventType = {
	ADMIN_LOGIN: 'admin.login',
	ADMIN_LOGIN_FAILED: 'admin.login_failed',
	ADMIN_LOGOUT: 'admin.logout',
	ADMIN_CREATED: 'admin.created',
	ADMIN_ROLE_CHANGED: 'admin.role_changed',
	ADMIN_DISABLED: 'admin.disabled',
	ADMIN_PASSKEY_REGISTERED: 'admin.passkey_registered',
	ADMIN_PASSKEY_DELETED: 'admin.passkey_deleted',
	USER_FROZEN: 'user.frozen',
	USER_UNFROZEN: 'user.unfrozen',
	USER_ICON_DELETED: 'user.icon_deleted',
	REPORT_REVIEWED: 'report.reviewed',
	UNFREEZE_REVIEWED: 'unfreeze.reviewed',
	API_KEY_REVOKED: 'api_key.revoked',
	API_RATE_LIMIT_CHANGED: 'api.rate_limit_changed',
	ANNOUNCEMENT_PUBLISHED: 'announcement.published',
	EMAIL_SENT: 'email.sent',
	HELP_ARTICLE_UPDATED: 'help.updated',
	INQUIRY_UPDATED: 'inquiry.updated',
	POLICY_PUBLISHED: 'policy.published'
} as const;

export type AuditEventType = (typeof AuditEventType)[keyof typeof AuditEventType];

export const AuditResult = {
	SUCCESS: 'success',
	FAILURE: 'failure'
} as const;

export type AuditResult = (typeof AuditResult)[keyof typeof AuditResult];

export interface AuditLogRecord {
	readonly id: string;
	readonly eventType: AuditEventType;
	readonly actorType: AuditActorType;
	readonly actorId: string | null;
	readonly targetType: string | null;
	readonly targetId: string | null;
	readonly result: AuditResult;
	readonly metadata: Record<string, unknown> | null;
	readonly occurredAt: Date;
}

// 秘匿値とみなすキー(大小無視・部分一致)。BR-COMMON-014。
const SENSITIVE_KEY_PATTERNS = [
	'password',
	'passwordhash',
	'secret',
	'token',
	'cookie',
	'session',
	'apikey',
	'keyhash',
	'challenge',
	'privatekey',
	'authorization'
];

function isSensitiveKey(key: string): boolean {
	const normalized = key.toLowerCase().replace(/[_-]/g, '');
	return SENSITIVE_KEY_PATTERNS.some((pattern) => normalized.includes(pattern));
}

/** メタデータから秘匿値を除去する(浅い 1 階層を走査。値が object でも秘匿キーごと落とす)。 */
export function sanitizeAuditMetadata(
	metadata: Record<string, unknown> | undefined | null
): Record<string, unknown> | null {
	if (!metadata) {
		return null;
	}
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(metadata)) {
		if (isSensitiveKey(key)) {
			continue;
		}
		result[key] = value;
	}
	return Object.keys(result).length > 0 ? result : null;
}

export interface BuildAuditLogInput {
	readonly id: string;
	readonly eventType: AuditEventType;
	readonly actorType: AuditActorType;
	readonly actorId?: string | null;
	readonly targetType?: string | null;
	readonly targetId?: string | null;
	readonly result?: AuditResult;
	readonly metadata?: Record<string, unknown> | null;
	readonly occurredAt: Date;
}

/** 監査ログレコードを構築する(秘匿値を除去済みで返す)。id/occurredAt はアプリ層が注入する。 */
export function buildAuditLog(input: BuildAuditLogInput): AuditLogRecord {
	return {
		id: input.id,
		eventType: input.eventType,
		actorType: input.actorType,
		actorId: input.actorId ?? null,
		targetType: input.targetType ?? null,
		targetId: input.targetId ?? null,
		result: input.result ?? AuditResult.SUCCESS,
		metadata: sanitizeAuditMetadata(input.metadata),
		occurredAt: input.occurredAt
	};
}
