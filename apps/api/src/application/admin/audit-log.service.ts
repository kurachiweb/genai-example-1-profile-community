// 監査ログ閲覧・絞り込みのユースケース(BR-ADMIN-010・US-0708)。追記専用ログを読み取り専用で提供する。
import { ADMIN_LIST_DEFAULT_LIMIT, ADMIN_LIST_MAX_LIMIT } from '../../domain/admin-limits';
import { AdminPermission, assertCan } from '../../domain/admin-role';
import { AuditActorType, AuditEventType } from '../../domain/audit-event';
import { AuditLogRepository } from './gateways';
import { AdminPrincipal, AuditLogListResult } from './models';

export interface AuditLogServiceDeps {
	readonly audit: AuditLogRepository;
}

export interface ListAuditLogsInput {
	readonly actorType?: AuditActorType;
	readonly eventType?: AuditEventType;
	readonly targetId?: string;
	readonly limit?: number;
	readonly offset?: number;
}

export class AuditLogService {
	constructor(private readonly deps: AuditLogServiceDeps) {}

	async list(actor: AdminPrincipal, input: ListAuditLogsInput = {}): Promise<AuditLogListResult> {
		assertCan(actor.role, AdminPermission.VIEW_AUDIT_LOG);
		const limit =
			input.limit === undefined
				? ADMIN_LIST_DEFAULT_LIMIT
				: Math.min(Math.max(Math.floor(input.limit), 1), ADMIN_LIST_MAX_LIMIT);
		const offset = input.offset === undefined ? 0 : Math.max(Math.floor(input.offset), 0);
		const { logs, total } = await this.deps.audit.list({
			actorType: input.actorType,
			eventType: input.eventType,
			targetId: input.targetId,
			limit,
			offset
		});
		return { logs, total };
	}
}
