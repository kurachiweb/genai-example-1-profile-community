// ユーザー一覧・詳細の閲覧ユースケース(BR-ADMIN-004)。職務上必要な範囲の表示に限る。
import { ADMIN_LIST_DEFAULT_LIMIT, ADMIN_LIST_MAX_LIMIT } from '../../domain/admin-limits';
import { AdminPermission, assertCan } from '../../domain/admin-role';
import { NotFoundError } from '../../domain/errors';
import { UserStatus } from '../../domain/user-status';
import { AdminUserRepository } from './gateways';
import { AdminPrincipal, UserListResult, UserSummary } from './models';

export interface UserAdminServiceDeps {
	readonly users: AdminUserRepository;
}

export interface ListUsersInput {
	readonly search?: string;
	readonly status?: UserStatus;
	readonly limit?: number;
	readonly offset?: number;
}

export class UserAdminService {
	constructor(private readonly deps: UserAdminServiceDeps) {}

	async listUsers(actor: AdminPrincipal, input: ListUsersInput = {}): Promise<UserListResult> {
		assertCan(actor.role, AdminPermission.VIEW_USERS);
		return this.deps.users.list({
			search: input.search?.trim() || undefined,
			status: input.status,
			limit: clampLimit(input.limit),
			offset: clampOffset(input.offset)
		});
	}

	async getUser(actor: AdminPrincipal, userId: string): Promise<UserSummary> {
		assertCan(actor.role, AdminPermission.VIEW_USERS);
		const summary = await this.deps.users.findSummary(userId);
		if (!summary) {
			throw new NotFoundError('対象のユーザーが見つかりません。');
		}
		return summary;
	}
}

function clampLimit(limit?: number): number {
	if (limit === undefined) {
		return ADMIN_LIST_DEFAULT_LIMIT;
	}
	const floored = Math.floor(limit);
	if (Number.isNaN(floored) || floored < 1) {
		return 1;
	}
	return Math.min(floored, ADMIN_LIST_MAX_LIMIT);
}

function clampOffset(offset?: number): number {
	if (offset === undefined) {
		return 0;
	}
	const floored = Math.floor(offset);
	return Number.isNaN(floored) || floored < 0 ? 0 : floored;
}
