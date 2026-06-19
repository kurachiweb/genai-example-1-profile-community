import { AdminAccountStatus } from '../../domain/admin-account';
import { AdminRole } from '../../domain/admin-role';
import { UnauthorizedError } from '../../domain/errors';
import { AdminAuthService } from './admin-auth.service';
import { AuditRecorder } from './audit-recorder';
import {
	FakeClock,
	FakeIdGenerator,
	FakePasswordHasher,
	InMemoryAdminAccountRepository,
	InMemoryAdminSessionStore,
	InMemoryAuditLogRepository
} from './fakes';
import { AdminAccountRecord } from './models';

function admin(overrides: Partial<AdminAccountRecord> = {}): AdminAccountRecord {
	return {
		id: 'admin-1',
		email: 'admin@example.com',
		passwordHash: 'hash:correct-horse',
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
	const sessions = new InMemoryAdminSessionStore(clock);
	const service = new AdminAuthService({
		admins,
		passwords: new FakePasswordHasher(),
		sessions,
		audit: new AuditRecorder({ audit: auditRepo, clock, ids: new FakeIdGenerator('log') })
	});
	return { service, auditRepo, sessions };
}

describe('AdminAuthService.login', () => {
	test('正しい資格情報でセッションと主体を返し、成功を監査に残す', async () => {
		const { service, auditRepo } = setup([admin()]);

		const result = await service.login({ email: 'Admin@Example.com', password: 'correct-horse' });

		expect(result.principal).toEqual({ adminId: 'admin-1', role: AdminRole.SUPER_ADMIN });
		expect(result.session.sessionId).toBeTruthy();
		expect(result.session.csrfToken).toBeTruthy();
		expect(auditRepo.records.some((r) => r.eventType === 'admin.login')).toBe(true);
	});

	test('誤ったパスワードは統一文面で UnauthorizedError、失敗を監査に残す(BR-COMMON-012)', async () => {
		const { service, auditRepo } = setup([admin()]);

		await expect(service.login({ email: 'admin@example.com', password: 'wrong' })).rejects.toThrow(
			UnauthorizedError
		);
		const failure = auditRepo.records.find((r) => r.eventType === 'admin.login_failed');
		expect(failure?.result).toBe('failure');
	});

	test('存在しないメールも同じ統一文面(列挙防止)', async () => {
		const { service } = setup([admin()]);

		await expect(
			service.login({ email: 'nobody@example.com', password: 'whatever' })
		).rejects.toThrow('メールアドレスかパスワードが正しくありません。');
	});

	test('無効化済みアカウントはログインできない', async () => {
		const { service } = setup([admin({ status: AdminAccountStatus.DISABLED })]);

		await expect(
			service.login({ email: 'admin@example.com', password: 'correct-horse' })
		).rejects.toThrow(UnauthorizedError);
	});
});

describe('AdminAuthService.resolvePrincipal', () => {
	test('有効なセッションは主体を返す', async () => {
		const { service } = setup([admin()]);
		const { session } = await service.login({
			email: 'admin@example.com',
			password: 'correct-horse'
		});

		const resolved = await service.resolvePrincipal(session.sessionId);

		expect(resolved?.principal.adminId).toBe('admin-1');
	});

	test('未指定/不明なセッションは null', async () => {
		const { service } = setup([admin()]);
		expect(await service.resolvePrincipal(undefined)).toBeNull();
		expect(await service.resolvePrincipal('nope')).toBeNull();
	});

	test('ログアウト後は解決されない', async () => {
		const { service } = setup([admin()]);
		const { session } = await service.login({
			email: 'admin@example.com',
			password: 'correct-horse'
		});

		await service.logout(session.sessionId, 'admin-1');

		expect(await service.resolvePrincipal(session.sessionId)).toBeNull();
	});
});
