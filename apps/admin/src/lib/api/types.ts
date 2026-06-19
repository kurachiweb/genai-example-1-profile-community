// 内部 GraphQL(api)の管理者サーフェスに対応する型。生成器導入までは手書きで整合させる。
export type AdminRole = 'super_admin' | 'moderator' | 'support' | 'viewer';
export type UserStatus = 'UNVERIFIED' | 'ACTIVE' | 'FROZEN' | 'WITHDRAWN';

export interface AdminMe {
	readonly adminId: string;
	readonly role: AdminRole;
}

export interface AdminStats {
	readonly totalUsers: number;
	readonly activeUsers: number;
	readonly unverifiedUsers: number;
	readonly frozenUsers: number;
	readonly withdrawnUsers: number;
	readonly effectivePublicProfiles: number;
	readonly openReports: number;
	readonly pendingUnfreezeRequests: number;
	readonly activeApiKeys: number;
}

export interface UserSummary {
	readonly id: string;
	readonly email: string;
	readonly handle: string | null;
	readonly status: UserStatus;
	readonly visibility: string | null;
	readonly displayName: string | null;
	readonly reportCount: number;
	readonly apiKeyCount: number;
	readonly createdAt: string;
}

export interface UserConnection {
	readonly users: readonly UserSummary[];
	readonly total: number;
}

export interface ApiKeyMeta {
	readonly id: string;
	readonly userId: string;
	readonly ownerEmail: string | null;
	readonly label: string | null;
	readonly scope: string;
	readonly status: string;
	readonly lastUsedAt: string | null;
	readonly createdAt: string;
	readonly revokedAt: string | null;
}

export interface ReportItem {
	readonly id: string;
	readonly targetUserId: string | null;
	readonly targetHandle: string;
	readonly reasonCategory: string;
	readonly detail: string | null;
	readonly status: string;
	readonly duplicateCount: number;
	readonly createdAt: string;
	readonly updatedAt: string;
}

export interface UnfreezeRequestItem {
	readonly id: string;
	readonly userId: string;
	readonly reason: string;
	readonly supplement: string | null;
	readonly status: string;
	readonly reviewedBy: string | null;
	readonly createdAt: string;
	readonly reviewedAt: string | null;
}

export interface AuditLogItem {
	readonly id: string;
	readonly eventType: string;
	readonly actorType: string;
	readonly actorId: string | null;
	readonly targetType: string | null;
	readonly targetId: string | null;
	readonly result: string;
	readonly metadataJson: string | null;
	readonly occurredAt: string;
}

export interface AuditLogConnection {
	readonly logs: readonly AuditLogItem[];
	readonly total: number;
}

export interface AdminAccount {
	readonly id: string;
	readonly email: string;
	readonly role: AdminRole;
	readonly status: string;
	readonly passkeyCount: number;
	readonly createdAt: string;
	readonly updatedAt: string;
}

export interface Passkey {
	readonly id: string;
	readonly nickname: string | null;
	readonly createdAt: string;
	readonly lastUsedAt: string | null;
}
