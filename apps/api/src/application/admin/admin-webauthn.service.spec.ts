import { AdminAccountStatus } from '../../domain/admin-account';
import { AdminRole } from '../../domain/admin-role';
import { UnauthorizedError, ValidationError } from '../../domain/errors';
import { AdminWebauthnService } from './admin-webauthn.service';
import { AuditRecorder } from './audit-recorder';
import {
	FakeClock,
	FakeIdGenerator,
	FakeWebauthnVerifier,
	InMemoryAdminAccountRepository,
	InMemoryAdminSessionStore,
	InMemoryAdminWebauthnCredentialRepository,
	InMemoryAuditLogRepository,
	InMemoryWebauthnChallengeStore
} from './fakes';
import { AdminAccountRecord, AdminPrincipal } from './models';
import { WebauthnVerifier } from './gateways';

function admin(overrides: Partial<AdminAccountRecord> = {}): AdminAccountRecord {
	return {
		id: 'admin-1',
		email: 'admin@example.com',
		passwordHash: 'hash:x',
		role: AdminRole.SUPER_ADMIN,
		status: AdminAccountStatus.ACTIVE,
		createdAt: new Date('2026-01-01T00:00:00Z'),
		updatedAt: new Date('2026-01-01T00:00:00Z'),
		...overrides
	};
}

function setup() {
	const admins = new InMemoryAdminAccountRepository([admin()]);
	const creds = new InMemoryAdminWebauthnCredentialRepository();
	const challenges = new InMemoryWebauthnChallengeStore();
	const verifier = new FakeWebauthnVerifier() as unknown as WebauthnVerifier;
	const clock = new FakeClock();
	const sessions = new InMemoryAdminSessionStore(clock);
	const auditRepo = new InMemoryAuditLogRepository();
	const service = new AdminWebauthnService({
		admins,
		creds,
		challenges,
		verifier,
		sessions,
		audit: new AuditRecorder({ audit: auditRepo, clock, ids: new FakeIdGenerator('log') }),
		clock,
		ids: new FakeIdGenerator('cred')
	});
	return { service, creds, auditRepo };
}

const ACTOR: AdminPrincipal = { adminId: 'admin-1', role: AdminRole.SUPER_ADMIN };

describe('AdminWebauthnService 登録', () => {
	test('登録チャレンジ発行 → 検証で資格情報を保存し監査に残す(AC-ADMIN-013)', async () => {
		const { service, creds, auditRepo } = setup();

		const options = await service.startRegistration(ACTOR);
		expect(options).toHaveProperty('challenge');

		const view = await service.finishRegistration(ACTOR, { id: 'cred-abc' }, 'YubiKey');

		expect(view.nickname).toBe('YubiKey');
		expect(await creds.listByAdmin('admin-1')).toHaveLength(1);
		expect(auditRepo.records.some((r) => r.eventType === 'admin.passkey_registered')).toBe(true);
	});

	test('チャレンジ未発行での finish は UnauthorizedError', async () => {
		const { service } = setup();
		await expect(service.finishRegistration(ACTOR, { id: 'cred-x' })).rejects.toThrow(
			UnauthorizedError
		);
	});

	test('長すぎる表示名は ValidationError', async () => {
		const { service } = setup();
		await service.startRegistration(ACTOR);
		await expect(
			service.finishRegistration(ACTOR, { id: 'cred-x' }, 'あ'.repeat(51))
		).rejects.toThrow(ValidationError);
	});
});

describe('AdminWebauthnService 認証(パスワードレス)', () => {
	test('登録済みパスキーで認証しセッションを発行する', async () => {
		const { service, auditRepo } = setup();
		await service.startRegistration(ACTOR);
		await service.finishRegistration(ACTOR, { id: 'cred-login' }, 'Primary');

		await service.startAuthentication('admin@example.com');
		const result = await service.finishAuthentication('admin@example.com', { id: 'cred-login' });

		expect(result.principal.adminId).toBe('admin-1');
		expect(result.session.sessionId).toBeTruthy();
		expect(auditRepo.records.some((r) => r.eventType === 'admin.login')).toBe(true);
	});

	test('未登録の資格情報での認証は UnauthorizedError', async () => {
		const { service } = setup();
		await service.startAuthentication('admin@example.com');
		await expect(
			service.finishAuthentication('admin@example.com', { id: 'unknown-cred' })
		).rejects.toThrow(UnauthorizedError);
	});
});
