import { AdminAccountStatus } from '../../domain/admin-account';
import { AdminRole } from '../../domain/admin-role';
import { ForbiddenError, NotFoundError, ValidationError } from '../../domain/errors';
import { AuditRecorder } from './audit-recorder';
import { AdminAccountService } from './admin-account.service';
import {
	FakeClock,
	FakeIdGenerator,
	FakePasswordHasher,
	InMemoryAdminAccountRepository,
	InMemoryAuditLogRepository
} from './fakes';
import { AdminAccountRecord, AdminPrincipal } from './models';

function buildAdmin(overrides: Partial<AdminAccountRecord> = {}): AdminAccountRecord {
	return {
		id: 'admin-1',
		email: 'admin@example.com',
		passwordHash: 'hash:secret',
		role: AdminRole.SUPER_ADMIN,
		status: AdminAccountStatus.ACTIVE,
		createdAt: new Date('2026-01-01T00:00:00Z'),
		updatedAt: new Date('2026-01-01T00:00:00Z'),
		...overrides
	};
}

function setup(records: AdminAccountRecord[]) {
	const admins = new InMemoryAdminAccountRepository(records);
	const auditRepo = new InMemoryAuditLogRepository();
	const clock = new FakeClock();
	const ids = new FakeIdGenerator('admin');
	const service = new AdminAccountService({
		admins,
		passwords: new FakePasswordHasher(),
		audit: new AuditRecorder({ audit: auditRepo, clock, ids: new FakeIdGenerator('log') }),
		clock,
		ids
	});
	return { service, admins, auditRepo };
}

const SUPER: AdminPrincipal = { adminId: 'admin-1', role: AdminRole.SUPER_ADMIN };
const VIEWER: AdminPrincipal = { adminId: 'admin-9', role: AdminRole.VIEWER };

describe('AdminAccountService.createAdmin', () => {
	test('super_admin が moderator を追加し監査に記録される(AC-ADMIN-002)', async () => {
		const { service, auditRepo } = setup([buildAdmin()]);

		const created = await service.createAdmin(SUPER, {
			email: 'New@Example.com',
			password: 'a-strong-password',
			role: AdminRole.MODERATOR
		});

		expect(created.email).toBe('new@example.com');
		expect(created.role).toBe(AdminRole.MODERATOR);
		expect(auditRepo.records).toHaveLength(1);
		expect(auditRepo.records[0].eventType).toBe('admin.created');
	});

	test('viewer は管理者を追加できない(AC-ADMIN-001)', async () => {
		const { service } = setup([
			buildAdmin(),
			buildAdmin({ id: 'admin-9', role: AdminRole.VIEWER })
		]);

		await expect(
			service.createAdmin(VIEWER, {
				email: 'x@example.com',
				password: 'a-strong-password',
				role: AdminRole.MODERATOR
			})
		).rejects.toThrow(ForbiddenError);
	});

	test('短いパスワードは ValidationError', async () => {
		const { service } = setup([buildAdmin()]);

		await expect(
			service.createAdmin(SUPER, {
				email: 'x@example.com',
				password: 'short',
				role: AdminRole.VIEWER
			})
		).rejects.toThrow(ValidationError);
	});

	test('既存メールは ValidationError', async () => {
		const { service } = setup([buildAdmin()]);

		await expect(
			service.createAdmin(SUPER, {
				email: 'admin@example.com',
				password: 'a-strong-password',
				role: AdminRole.VIEWER
			})
		).rejects.toThrow(ValidationError);
	});
});

describe('AdminAccountService.changeRole', () => {
	test('唯一のスーパー管理者の降格は拒否される(AC-ADMIN-003)', async () => {
		const { service } = setup([buildAdmin()]);

		await expect(service.changeRole(SUPER, 'admin-1', AdminRole.MODERATOR)).rejects.toThrow(
			ValidationError
		);
	});

	test('スーパー管理者が複数いれば降格でき監査に残る', async () => {
		const { service, auditRepo } = setup([
			buildAdmin(),
			buildAdmin({ id: 'admin-2', email: 'two@example.com' })
		]);

		const updated = await service.changeRole(SUPER, 'admin-2', AdminRole.MODERATOR);

		expect(updated.role).toBe(AdminRole.MODERATOR);
		expect(auditRepo.records[0].eventType).toBe('admin.role_changed');
		expect(auditRepo.records[0].metadata).toEqual({ from: 'super_admin', to: 'moderator' });
	});

	test('存在しない対象は NotFound', async () => {
		const { service } = setup([buildAdmin()]);

		await expect(service.changeRole(SUPER, 'missing', AdminRole.VIEWER)).rejects.toThrow(
			NotFoundError
		);
	});
});

describe('AdminAccountService.disableAdmin', () => {
	test('自分自身は無効化できない', async () => {
		const { service } = setup([buildAdmin(), buildAdmin({ id: 'admin-2' })]);

		await expect(service.disableAdmin(SUPER, 'admin-1')).rejects.toThrow(ValidationError);
	});

	test('他の管理者を無効化でき監査に残る', async () => {
		const { service, auditRepo } = setup([
			buildAdmin(),
			buildAdmin({ id: 'admin-2', role: AdminRole.MODERATOR, email: 'm@example.com' })
		]);

		const updated = await service.disableAdmin(SUPER, 'admin-2');

		expect(updated.status).toBe(AdminAccountStatus.DISABLED);
		expect(auditRepo.records[0].eventType).toBe('admin.disabled');
	});
});

describe('AdminAccountService.listAdmins', () => {
	test('viewer 以上は一覧でき、passwordHash は含まれない', async () => {
		const { service } = setup([buildAdmin()]);

		const list = await service.listAdmins(SUPER);

		expect(list).toHaveLength(1);
		expect(list[0]).not.toHaveProperty('passwordHash');
	});
});
