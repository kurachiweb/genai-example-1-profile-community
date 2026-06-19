// 管理者アカウントの状態とロックアウト防止ルール(BR-ADMIN-001/002・AC-ADMIN-003)。
// 「自分自身の権限の剥奪」「最後のスーパー管理者の削除/降格」を防ぎ、運営から締め出されないようにする。
import { AdminRole } from './admin-role';
import { ValidationError } from './errors';

export const AdminAccountStatus = {
	ACTIVE: 'active',
	DISABLED: 'disabled'
} as const;

export type AdminAccountStatus = (typeof AdminAccountStatus)[keyof typeof AdminAccountStatus];

export function isAdminAccountStatus(value: unknown): value is AdminAccountStatus {
	return value === AdminAccountStatus.ACTIVE || value === AdminAccountStatus.DISABLED;
}

export interface RoleChangeContext {
	readonly actorId: string;
	readonly targetId: string;
	readonly targetCurrentRole: AdminRole;
	readonly newRole: AdminRole;
	/** 現在の有効(active)な super_admin 数。 */
	readonly activeSuperAdminCount: number;
}

/** ロール変更の可否を検証する。違反時は ValidationError(操作拒否)。 */
export function assertRoleChangeAllowed(context: RoleChangeContext): void {
	const { actorId, targetId, targetCurrentRole, newRole, activeSuperAdminCount } = context;
	if (targetCurrentRole === newRole) {
		return;
	}
	const isDemotionFromSuper =
		targetCurrentRole === AdminRole.SUPER_ADMIN && newRole !== AdminRole.SUPER_ADMIN;

	if (isDemotionFromSuper && actorId === targetId) {
		throw new ValidationError('自分自身のスーパー管理者権限は剥奪できません。');
	}
	if (isDemotionFromSuper && activeSuperAdminCount <= 1) {
		throw new ValidationError('最後のスーパー管理者は降格できません。');
	}
}

export interface DisableContext {
	readonly actorId: string;
	readonly targetId: string;
	readonly targetRole: AdminRole;
	readonly activeSuperAdminCount: number;
}

/** アカウント無効化(削除相当)の可否を検証する。違反時は ValidationError。 */
export function assertDisableAllowed(context: DisableContext): void {
	const { actorId, targetId, targetRole, activeSuperAdminCount } = context;
	if (actorId === targetId) {
		throw new ValidationError('自分自身のアカウントは無効化できません。');
	}
	if (targetRole === AdminRole.SUPER_ADMIN && activeSuperAdminCount <= 1) {
		throw new ValidationError('最後のスーパー管理者は無効化できません。');
	}
}
