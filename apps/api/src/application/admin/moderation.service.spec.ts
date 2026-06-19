import { AdminRole } from '../../domain/admin-role';
import { ForbiddenError, ValidationError } from '../../domain/errors';
import { ReportStatus, UnfreezeRequestStatus } from '../../domain/moderation';
import { UserStatus } from '../../domain/user-status';
import { AuditRecorder } from './audit-recorder';
import {
	FakeClock,
	FakeIdGenerator,
	InMemoryApiKeyAdminRepository,
	InMemoryAdminUserRepository,
	InMemoryAuditLogRepository,
	InMemoryReportRepository,
	InMemorySuspensionRepository,
	InMemoryUnfreezeRequestRepository
} from './fakes';
import { ModerationService } from './moderation.service';
import {
	AdminPrincipal,
	ApiKeyMeta,
	ReportRecord,
	UnfreezeRequestRecord,
	UserSummary
} from './models';

const MOD: AdminPrincipal = { adminId: 'admin-1', role: AdminRole.MODERATOR };
const VIEWER: AdminPrincipal = { adminId: 'admin-9', role: AdminRole.VIEWER };

function user(overrides: Partial<UserSummary> = {}): UserSummary {
	return {
		id: 'user-1',
		email: 'u@example.com',
		handle: 'u',
		status: UserStatus.ACTIVE,
		visibility: 'public',
		displayName: 'User One',
		createdAt: new Date('2026-01-01T00:00:00Z'),
		reportCount: 1,
		apiKeyCount: 2,
		...overrides
	};
}

function setup(
	options: {
		users?: UserSummary[];
		apiKeys?: ApiKeyMeta[];
		reports?: ReportRecord[];
		unfreeze?: UnfreezeRequestRecord[];
	} = {}
) {
	const users = new InMemoryAdminUserRepository(options.users ?? [user()]);
	const suspensions = new InMemorySuspensionRepository();
	const unfreezeRequests = new InMemoryUnfreezeRequestRepository(options.unfreeze ?? []);
	const reports = new InMemoryReportRepository(options.reports ?? []);
	const apiKeys = new InMemoryApiKeyAdminRepository(options.apiKeys ?? []);
	const auditRepo = new InMemoryAuditLogRepository();
	const clock = new FakeClock();
	const service = new ModerationService({
		users,
		suspensions,
		unfreezeRequests,
		reports,
		apiKeys,
		audit: new AuditRecorder({ audit: auditRepo, clock, ids: new FakeIdGenerator('log') }),
		clock,
		ids: new FakeIdGenerator('sus')
	});
	return { service, users, suspensions, apiKeys, auditRepo };
}

describe('ModerationService.freezeUser', () => {
	test('ACTIVE を凍結し、API キーを失効、凍結記録と監査を残す(AC-ADMIN-006)', async () => {
		const { service, users, suspensions, apiKeys, auditRepo } = setup({
			apiKeys: [
				{
					id: 'k1',
					userId: 'user-1',
					ownerEmail: 'u@example.com',
					label: null,
					scope: 'read',
					status: 'active',
					lastUsedAt: null,
					createdAt: new Date('2026-01-01T00:00:00Z'),
					revokedAt: null
				}
			]
		});

		const summary = await service.freezeUser(MOD, 'user-1', 'spam');

		expect(summary.status).toBe(UserStatus.FROZEN);
		expect(await users.getStatus('user-1')).toBe(UserStatus.FROZEN);
		expect(suspensions.records).toHaveLength(1);
		expect((await apiKeys.listMeta())[0].status).toBe('revoked');
		expect(auditRepo.records.some((r) => r.eventType === 'user.frozen')).toBe(true);
	});

	test('viewer は凍結できない(AC-ADMIN-001)', async () => {
		const { service } = setup();
		await expect(service.freezeUser(VIEWER, 'user-1', 'spam')).rejects.toThrow(ForbiddenError);
	});

	test('既に FROZEN なユーザーへの凍結は不正遷移(ValidationError)', async () => {
		const { service } = setup({ users: [user({ status: UserStatus.FROZEN })] });
		await expect(service.freezeUser(MOD, 'user-1', 'spam')).rejects.toThrow(ValidationError);
	});
});

describe('ModerationService.deleteIcon', () => {
	test('アイコンを既定に戻し監査に残す(AC-ADMIN-005)', async () => {
		const { service, users, auditRepo } = setup();
		await service.deleteIcon(MOD, 'user-1');
		expect(users.clearedIcons).toContain('user-1');
		expect(auditRepo.records.some((r) => r.eventType === 'user.icon_deleted')).toBe(true);
	});
});

describe('ModerationService.reviewReport', () => {
	test('OPEN の通報を RESOLVED にして監査に残す', async () => {
		const { service, auditRepo } = setup({
			reports: [
				{
					id: 'r1',
					targetUserId: 'user-1',
					targetHandle: 'u',
					reasonCategory: 'spam',
					detail: null,
					status: ReportStatus.OPEN,
					duplicateCount: 1,
					createdAt: new Date('2026-01-01T00:00:00Z'),
					updatedAt: new Date('2026-01-01T00:00:00Z')
				}
			]
		});

		await service.reviewReport(MOD, 'r1', ReportStatus.RESOLVED);

		expect(auditRepo.records.some((r) => r.eventType === 'report.reviewed')).toBe(true);
	});
});

describe('ModerationService.reviewUnfreezeRequest', () => {
	test('承認でユーザーを ACTIVE に戻し、凍結を解除し監査に残す(AC-ADMIN-007)', async () => {
		const { service, users, suspensions, auditRepo } = setup({
			users: [user({ status: UserStatus.FROZEN })],
			unfreeze: [
				{
					id: 'uf1',
					userId: 'user-1',
					suspensionId: null,
					reason: '反省しました',
					supplement: null,
					status: UnfreezeRequestStatus.PENDING,
					reviewedBy: null,
					createdAt: new Date('2026-02-01T00:00:00Z'),
					reviewedAt: null
				}
			]
		});
		await suspensions.create({
			id: 's1',
			userId: 'user-1',
			reasonCategory: 'spam',
			status: 'active',
			suspendedBy: 'admin-1',
			suspendedAt: new Date('2026-01-15T00:00:00Z'),
			liftedAt: null
		});

		await service.reviewUnfreezeRequest(MOD, 'uf1', true);

		expect(await users.getStatus('user-1')).toBe(UserStatus.ACTIVE);
		expect(suspensions.records[0].status).toBe('lifted');
		expect(auditRepo.records.some((r) => r.eventType === 'user.unfrozen')).toBe(true);
		expect(auditRepo.records.some((r) => r.eventType === 'unfreeze.reviewed')).toBe(true);
	});

	test('却下はユーザー状態を変えず監査に残す', async () => {
		const { service, users, auditRepo } = setup({
			users: [user({ status: UserStatus.FROZEN })],
			unfreeze: [
				{
					id: 'uf1',
					userId: 'user-1',
					suspensionId: null,
					reason: 'お願いします',
					supplement: null,
					status: UnfreezeRequestStatus.PENDING,
					reviewedBy: null,
					createdAt: new Date('2026-02-01T00:00:00Z'),
					reviewedAt: null
				}
			]
		});

		await service.reviewUnfreezeRequest(MOD, 'uf1', false);

		expect(await users.getStatus('user-1')).toBe(UserStatus.FROZEN);
		expect(auditRepo.records.some((r) => r.eventType === 'unfreeze.reviewed')).toBe(true);
		expect(auditRepo.records.some((r) => r.eventType === 'user.unfrozen')).toBe(false);
	});
});
