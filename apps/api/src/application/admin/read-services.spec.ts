import { AdminRole } from '../../domain/admin-role';
import { AuditActorType, AuditEventType, AuditResult } from '../../domain/audit-event';
import { Visibility } from '../../domain/effective-public';
import { ForbiddenError, NotFoundError } from '../../domain/errors';
import { UserStatus } from '../../domain/user-status';
import { AuditLogService } from './audit-log.service';
import {
	FakeStatsRepository,
	InMemoryAdminUserRepository,
	InMemoryAuditLogRepository
} from './fakes';
import { AdminPrincipal, AdminStats, UserSummary } from './models';
import { StatsService } from './stats.service';
import { UserAdminService } from './user-admin.service';

const VIEWER: AdminPrincipal = { adminId: 'a-1', role: AdminRole.VIEWER };

function users(): UserSummary[] {
	return [
		{
			id: 'u1',
			email: 'a@example.com',
			handle: 'a',
			status: UserStatus.ACTIVE,
			visibility: Visibility.PUBLIC,
			displayName: 'A',
			createdAt: new Date('2026-01-01T00:00:00Z'),
			reportCount: 0,
			apiKeyCount: 0
		},
		{
			id: 'u2',
			email: 'b@example.com',
			handle: 'b',
			status: UserStatus.FROZEN,
			visibility: Visibility.PUBLIC,
			displayName: 'B',
			createdAt: new Date('2026-01-02T00:00:00Z'),
			reportCount: 3,
			apiKeyCount: 1
		}
	];
}

describe('UserAdminService', () => {
	test('viewer 以上は一覧でき、状態で絞り込める(AC-ADMIN-004)', async () => {
		const service = new UserAdminService({ users: new InMemoryAdminUserRepository(users()) });

		const all = await service.listUsers(VIEWER);
		const frozen = await service.listUsers(VIEWER, { status: UserStatus.FROZEN });

		expect(all.total).toBe(2);
		expect(frozen.total).toBe(1);
		expect(frozen.users[0].id).toBe('u2');
	});

	test('存在しないユーザー詳細は NotFound', async () => {
		const service = new UserAdminService({ users: new InMemoryAdminUserRepository(users()) });
		await expect(service.getUser(VIEWER, 'missing')).rejects.toThrow(NotFoundError);
	});

	test('存在するユーザー詳細を取得できる', async () => {
		const service = new UserAdminService({ users: new InMemoryAdminUserRepository(users()) });
		const detail = await service.getUser(VIEWER, 'u2');
		expect(detail.reportCount).toBe(3);
	});

	test('検索とページング(limit/offset)が反映される', async () => {
		const many: UserSummary[] = Array.from({ length: 5 }, (_, index) => ({
			id: `m${index}`,
			email: `m${index}@example.com`,
			handle: `m${index}`,
			status: UserStatus.ACTIVE,
			visibility: Visibility.PUBLIC,
			displayName: `M${index}`,
			createdAt: new Date('2026-01-01T00:00:00Z'),
			reportCount: 0,
			apiKeyCount: 0
		}));
		const service = new UserAdminService({ users: new InMemoryAdminUserRepository(many) });

		const page = await service.listUsers(VIEWER, { limit: 2, offset: 2 });
		expect(page.total).toBe(5);
		expect(page.users.map((u) => u.id)).toEqual(['m2', 'm3']);
	});

	test('limit/offset は安全側にクランプされる(0→1・負→0・超過→最大)', async () => {
		const service = new UserAdminService({ users: new InMemoryAdminUserRepository(users()) });
		const low = await service.listUsers(VIEWER, { limit: 0, offset: -5 });
		const high = await service.listUsers(VIEWER, { limit: 9999 });
		expect(low.users).toHaveLength(1);
		expect(high.total).toBe(2);
	});

	test('viewer 未満の経路(不明ロール)は Forbidden', async () => {
		const service = new UserAdminService({ users: new InMemoryAdminUserRepository(users()) });
		await expect(service.listUsers({ adminId: 'x', role: 'unknown' as AdminRole })).rejects.toThrow(
			ForbiddenError
		);
	});
});

describe('StatsService', () => {
	test('viewer 以上は統計を取得できる(AC-ADMIN-010)', async () => {
		const stats: AdminStats = {
			totalUsers: 100,
			activeUsers: 80,
			unverifiedUsers: 10,
			frozenUsers: 5,
			withdrawnUsers: 5,
			effectivePublicProfiles: 70,
			openReports: 3,
			pendingUnfreezeRequests: 1,
			activeApiKeys: 12
		};
		const service = new StatsService({ stats: new FakeStatsRepository(stats) });

		expect(await service.getStats(VIEWER)).toEqual(stats);
	});
});

describe('AuditLogService', () => {
	test('viewer 以上は監査ログを閲覧・絞り込める(AC-ADMIN-011/US-0708)', async () => {
		const repo = new InMemoryAuditLogRepository();
		await repo.append({
			id: 'l1',
			eventType: AuditEventType.USER_FROZEN,
			actorType: AuditActorType.ADMIN,
			actorId: 'admin-1',
			targetType: 'user',
			targetId: 'u2',
			result: AuditResult.SUCCESS,
			metadata: null,
			occurredAt: new Date('2026-06-01T00:00:00Z')
		});
		const service = new AuditLogService({ audit: repo });

		const result = await service.list(VIEWER, { eventType: AuditEventType.USER_FROZEN });

		expect(result.total).toBe(1);
		expect(result.logs[0].targetId).toBe('u2');
	});

	test('権限の無いロールは閲覧不可', async () => {
		const service = new AuditLogService({ audit: new InMemoryAuditLogRepository() });
		// 不正なロールを模した主体(型上は AdminRole だが存在しない権限経路を確認するため moderator で監査閲覧は許可される)
		// ここでは VIEW_AUDIT_LOG を持たないケースを別途検証する代わりに、assertCan の経路を ForbiddenError で確認する。
		const noView = { adminId: 'x', role: 'unknown' as AdminRole };
		await expect(service.list(noView)).rejects.toThrow(ForbiddenError);
	});
});
