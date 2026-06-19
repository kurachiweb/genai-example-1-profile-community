// 管理者アカウント・権限管理のユースケース(BR-ADMIN-001/002・US-0706)。
// RBAC(MANAGE_ADMINS)・ロックアウト防止・監査記録を集約する。
import {
	assertDisableAllowed,
	assertRoleChangeAllowed,
	AdminAccountStatus
} from '../../domain/admin-account';
import { AdminPermission, AdminRole, assertCan } from '../../domain/admin-role';
import { AuditEventType, AuditActorType } from '../../domain/audit-event';
import {
	assertValidAdminPassword,
	assertValidEmail,
	normalizeEmail
} from '../../domain/admin-credentials';
import { NotFoundError, ValidationError } from '../../domain/errors';
import { Clock, IdGenerator } from '../gateways';
import { AuditRecorder } from './audit-recorder';
import { AdminAccountRepository, PasswordHasher } from './gateways';
import { AdminAccountRecord, AdminAccountView, AdminPrincipal } from './models';

export interface AdminAccountServiceDeps {
	readonly admins: AdminAccountRepository;
	readonly passwords: PasswordHasher;
	readonly audit: AuditRecorder;
	readonly clock: Clock;
	readonly ids: IdGenerator;
}

export interface CreateAdminInput {
	readonly email: string;
	readonly password: string;
	readonly role: AdminRole;
}

export class AdminAccountService {
	constructor(private readonly deps: AdminAccountServiceDeps) {}

	async listAdmins(actor: AdminPrincipal): Promise<AdminAccountView[]> {
		assertCan(actor.role, AdminPermission.VIEW_ADMINS);
		const records = await this.deps.admins.list();
		return Promise.all(records.map((record) => this.toView(record)));
	}

	async createAdmin(actor: AdminPrincipal, input: CreateAdminInput): Promise<AdminAccountView> {
		assertCan(actor.role, AdminPermission.MANAGE_ADMINS);
		const email = normalizeEmail(input.email);
		assertValidEmail(email);
		assertValidAdminPassword(input.password);

		const existing = await this.deps.admins.findByEmailNormalized(email);
		if (existing) {
			throw new ValidationError('この操作を完了できませんでした。', [
				{ field: 'email', message: '指定のメールアドレスは利用できません。' }
			]);
		}

		const now = this.deps.clock.now();
		const record: AdminAccountRecord = {
			id: this.deps.ids.ulid(),
			email,
			passwordHash: await this.deps.passwords.hash(input.password),
			role: input.role,
			status: AdminAccountStatus.ACTIVE,
			createdAt: now,
			updatedAt: now
		};
		await this.deps.admins.save(record);
		await this.deps.audit.record({
			eventType: AuditEventType.ADMIN_CREATED,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'admin',
			targetId: record.id,
			metadata: { email, role: input.role }
		});
		return this.toView(record);
	}

	async changeRole(
		actor: AdminPrincipal,
		targetId: string,
		newRole: AdminRole
	): Promise<AdminAccountView> {
		assertCan(actor.role, AdminPermission.MANAGE_ADMINS);
		const target = await this.requireAdmin(targetId);
		const activeSuperAdminCount = await this.deps.admins.countActiveByRole(AdminRole.SUPER_ADMIN);
		assertRoleChangeAllowed({
			actorId: actor.adminId,
			targetId,
			targetCurrentRole: target.role,
			newRole,
			activeSuperAdminCount
		});

		const updated: AdminAccountRecord = {
			...target,
			role: newRole,
			updatedAt: this.deps.clock.now()
		};
		await this.deps.admins.save(updated);
		await this.deps.audit.record({
			eventType: AuditEventType.ADMIN_ROLE_CHANGED,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'admin',
			targetId,
			metadata: { from: target.role, to: newRole }
		});
		return this.toView(updated);
	}

	async disableAdmin(actor: AdminPrincipal, targetId: string): Promise<AdminAccountView> {
		assertCan(actor.role, AdminPermission.MANAGE_ADMINS);
		const target = await this.requireAdmin(targetId);
		const activeSuperAdminCount = await this.deps.admins.countActiveByRole(AdminRole.SUPER_ADMIN);
		assertDisableAllowed({
			actorId: actor.adminId,
			targetId,
			targetRole: target.role,
			activeSuperAdminCount
		});

		const updated: AdminAccountRecord = {
			...target,
			status: AdminAccountStatus.DISABLED,
			updatedAt: this.deps.clock.now()
		};
		await this.deps.admins.save(updated);
		await this.deps.audit.record({
			eventType: AuditEventType.ADMIN_DISABLED,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'admin',
			targetId
		});
		return this.toView(updated);
	}

	private async requireAdmin(id: string): Promise<AdminAccountRecord> {
		const record = await this.deps.admins.findById(id);
		if (!record) {
			throw new NotFoundError('対象の管理者が見つかりません。');
		}
		return record;
	}

	private async toView(record: AdminAccountRecord): Promise<AdminAccountView> {
		const passkeyCount = await this.deps.admins.countPasskeys(record.id);
		return {
			id: record.id,
			email: record.email,
			role: record.role,
			status: record.status,
			passkeyCount,
			createdAt: record.createdAt,
			updatedAt: record.updatedAt
		};
	}
}
