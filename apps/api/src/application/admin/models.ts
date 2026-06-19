// 管理者ユースケースが扱う中立データ構造(Request/Response Model)。
// MikroORM エンティティでも GraphQL 型でもない(clean-architecture)。
import { AdminAccountStatus } from '../../domain/admin-account';
import { AdminRole } from '../../domain/admin-role';
import { AuditActorType, AuditEventType, AuditResult } from '../../domain/audit-event';
import {
	ReportReasonCategory,
	ReportStatus,
	SuspensionStatus,
	UnfreezeRequestStatus
} from '../../domain/moderation';
import { UserStatus } from '../../domain/user-status';

/** セッションから解決される操作者(認可の主体)。 */
export interface AdminPrincipal {
	readonly adminId: string;
	readonly role: AdminRole;
}

export interface AdminAccountRecord {
	readonly id: string;
	readonly email: string;
	readonly passwordHash: string;
	readonly role: AdminRole;
	readonly status: AdminAccountStatus;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

/** 画面・API へ返す管理者の公開ビュー(passwordHash を含めない)。 */
export interface AdminAccountView {
	readonly id: string;
	readonly email: string;
	readonly role: AdminRole;
	readonly status: AdminAccountStatus;
	readonly passkeyCount: number;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export interface UserSummary {
	readonly id: string;
	readonly email: string;
	readonly handle: string | null;
	readonly status: UserStatus;
	readonly visibility: string | null;
	readonly displayName: string | null;
	readonly createdAt: Date;
	readonly reportCount: number;
	readonly apiKeyCount: number;
}

export interface UserListFilter {
	readonly search?: string;
	readonly status?: UserStatus;
	readonly limit: number;
	readonly offset: number;
}

export interface UserListResult {
	readonly users: readonly UserSummary[];
	readonly total: number;
}

/** API キーのメタ情報(秘匿値は含めない、BR-ADMIN-007/AC-ADMIN-008)。 */
export interface ApiKeyMeta {
	readonly id: string;
	readonly userId: string;
	readonly ownerEmail: string | null;
	readonly label: string | null;
	readonly scope: string;
	readonly status: string;
	readonly lastUsedAt: Date | null;
	readonly createdAt: Date;
	readonly revokedAt: Date | null;
}

export interface ReportRecord {
	readonly id: string;
	readonly targetUserId: string | null;
	readonly targetHandle: string;
	readonly reasonCategory: ReportReasonCategory;
	readonly detail: string | null;
	readonly status: ReportStatus;
	readonly duplicateCount: number;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export interface SuspensionRecord {
	readonly id: string;
	readonly userId: string;
	readonly reasonCategory: string;
	readonly status: SuspensionStatus;
	readonly suspendedBy: string;
	readonly suspendedAt: Date;
	readonly liftedAt: Date | null;
}

export interface UnfreezeRequestRecord {
	readonly id: string;
	readonly userId: string;
	readonly suspensionId: string | null;
	readonly reason: string;
	readonly supplement: string | null;
	readonly status: UnfreezeRequestStatus;
	readonly reviewedBy: string | null;
	readonly createdAt: Date;
	readonly reviewedAt: Date | null;
}

/** 利用統計(集計値、BR-ADMIN-009)。 */
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

export interface AuditLogQuery {
	readonly actorType?: AuditActorType;
	readonly eventType?: AuditEventType;
	readonly targetId?: string;
	readonly limit: number;
	readonly offset: number;
}

export interface AuditLogView {
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

export interface AuditLogListResult {
	readonly logs: readonly AuditLogView[];
	readonly total: number;
}
