// 管理者ロールと権限マトリクス(RBAC)。正本は features/07-admin-console.md BR-ADMIN-002。
// 最小権限の原則に従い、各操作は対応する権限を要求する。権限のない操作は UI 不可かつ API でも 403(AC-ADMIN-001)。
import { ForbiddenError } from './errors';

export const AdminRole = {
	SUPER_ADMIN: 'super_admin',
	MODERATOR: 'moderator',
	SUPPORT: 'support',
	VIEWER: 'viewer'
} as const;

export type AdminRole = (typeof AdminRole)[keyof typeof AdminRole];

export function isAdminRole(value: unknown): value is AdminRole {
	return (
		value === AdminRole.SUPER_ADMIN ||
		value === AdminRole.MODERATOR ||
		value === AdminRole.SUPPORT ||
		value === AdminRole.VIEWER
	);
}

// 権限(操作)の語彙。画面の操作単位と対称にし、ガード/ユースケースで参照する。
export const AdminPermission = {
	// 閲覧(viewer 以上)
	VIEW_DASHBOARD: 'VIEW_DASHBOARD',
	VIEW_STATS: 'VIEW_STATS',
	VIEW_USERS: 'VIEW_USERS',
	VIEW_REPORTS: 'VIEW_REPORTS',
	VIEW_UNFREEZE_REQUESTS: 'VIEW_UNFREEZE_REQUESTS',
	VIEW_API_KEYS: 'VIEW_API_KEYS',
	VIEW_AUDIT_LOG: 'VIEW_AUDIT_LOG',
	VIEW_ADMINS: 'VIEW_ADMINS',
	VIEW_CONTENT: 'VIEW_CONTENT',
	VIEW_INQUIRIES: 'VIEW_INQUIRIES',
	// モデレーション(moderator 以上)
	MODERATE_DELETE_ICON: 'MODERATE_DELETE_ICON',
	MODERATE_FREEZE_USER: 'MODERATE_FREEZE_USER',
	MODERATE_REVIEW_REPORT: 'MODERATE_REVIEW_REPORT',
	MODERATE_REVIEW_UNFREEZE: 'MODERATE_REVIEW_UNFREEZE',
	API_KEY_REVOKE: 'API_KEY_REVOKE',
	// サポート(support 以上)
	INQUIRY_HANDLE: 'INQUIRY_HANDLE',
	HELP_EDIT: 'HELP_EDIT',
	ANNOUNCEMENT_DRAFT: 'ANNOUNCEMENT_DRAFT',
	// 上位ガバナンス(super_admin のみ)
	ANNOUNCEMENT_PUBLISH: 'ANNOUNCEMENT_PUBLISH',
	EMAIL_SEND: 'EMAIL_SEND',
	API_RATE_LIMIT_UPDATE: 'API_RATE_LIMIT_UPDATE',
	MANAGE_ADMINS: 'MANAGE_ADMINS',
	POLICY_EDIT: 'POLICY_EDIT',
	POLICY_PUBLISH: 'POLICY_PUBLISH'
} as const;

export type AdminPermission = (typeof AdminPermission)[keyof typeof AdminPermission];

// 閲覧系は全ロール共通(viewer 以上)。
const VIEW_PERMISSIONS: readonly AdminPermission[] = [
	AdminPermission.VIEW_DASHBOARD,
	AdminPermission.VIEW_STATS,
	AdminPermission.VIEW_USERS,
	AdminPermission.VIEW_REPORTS,
	AdminPermission.VIEW_UNFREEZE_REQUESTS,
	AdminPermission.VIEW_API_KEYS,
	AdminPermission.VIEW_AUDIT_LOG,
	AdminPermission.VIEW_ADMINS,
	AdminPermission.VIEW_CONTENT,
	AdminPermission.VIEW_INQUIRIES
];

const MODERATOR_PERMISSIONS: readonly AdminPermission[] = [
	...VIEW_PERMISSIONS,
	AdminPermission.MODERATE_DELETE_ICON,
	AdminPermission.MODERATE_FREEZE_USER,
	AdminPermission.MODERATE_REVIEW_REPORT,
	AdminPermission.MODERATE_REVIEW_UNFREEZE,
	AdminPermission.API_KEY_REVOKE,
	// お知らせの公開・メール通知の配信は moderator 以上(BR-CONTENT-001/003)。
	AdminPermission.ANNOUNCEMENT_DRAFT,
	AdminPermission.ANNOUNCEMENT_PUBLISH,
	AdminPermission.EMAIL_SEND
];

const SUPPORT_PERMISSIONS: readonly AdminPermission[] = [
	...VIEW_PERMISSIONS,
	AdminPermission.INQUIRY_HANDLE,
	AdminPermission.HELP_EDIT,
	AdminPermission.ANNOUNCEMENT_DRAFT
];

// super_admin は全権限を持つ。
const ALL_PERMISSIONS: readonly AdminPermission[] = Object.values(AdminPermission);

const PERMISSIONS_BY_ROLE: Record<AdminRole, ReadonlySet<AdminPermission>> = {
	[AdminRole.SUPER_ADMIN]: new Set(ALL_PERMISSIONS),
	[AdminRole.MODERATOR]: new Set(MODERATOR_PERMISSIONS),
	[AdminRole.SUPPORT]: new Set(SUPPORT_PERMISSIONS),
	[AdminRole.VIEWER]: new Set(VIEW_PERMISSIONS)
};

export function can(role: AdminRole, permission: AdminPermission): boolean {
	// 未知のロール(不正なセッション・データ破損)は権限なしとして安全側に倒す。
	const granted = PERMISSIONS_BY_ROLE[role];
	return granted ? granted.has(permission) : false;
}

/** 権限が無ければ ForbiddenError(403)。UI 非表示だけに頼らず API でも強制する(AC-ADMIN-001)。 */
export function assertCan(role: AdminRole, permission: AdminPermission): void {
	if (!can(role, permission)) {
		throw new ForbiddenError('この操作を行う権限がありません。');
	}
}

export function permissionsFor(role: AdminRole): readonly AdminPermission[] {
	return [...PERMISSIONS_BY_ROLE[role]];
}
