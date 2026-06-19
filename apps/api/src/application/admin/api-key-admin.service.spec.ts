import { AdminRole } from '../../domain/admin-role';
import { ForbiddenError, NotFoundError, ValidationError } from '../../domain/errors';
import { AuditRecorder } from './audit-recorder';
import { ApiKeyAdminService } from './api-key-admin.service';
import {
	FakeClock,
	FakeIdGenerator,
	InMemoryApiKeyAdminRepository,
	InMemoryAuditLogRepository,
	InMemorySettingsRepository
} from './fakes';
import { AdminPrincipal, ApiKeyMeta } from './models';

const SUPER: AdminPrincipal = { adminId: 'admin-1', role: AdminRole.SUPER_ADMIN };
const MOD: AdminPrincipal = { adminId: 'admin-2', role: AdminRole.MODERATOR };

function key(overrides: Partial<ApiKeyMeta> = {}): ApiKeyMeta {
	return {
		id: 'k1',
		userId: 'user-1',
		ownerEmail: 'u@example.com',
		label: 'CI',
		scope: 'read',
		status: 'active',
		lastUsedAt: null,
		createdAt: new Date('2026-01-01T00:00:00Z'),
		revokedAt: null,
		...overrides
	};
}

function setup(keys: ApiKeyMeta[] = [key()], rateLimit: number | null = null) {
	const apiKeys = new InMemoryApiKeyAdminRepository(keys);
	const settings = new InMemorySettingsRepository(rateLimit);
	const auditRepo = new InMemoryAuditLogRepository();
	const clock = new FakeClock();
	const service = new ApiKeyAdminService({
		apiKeys,
		settings,
		audit: new AuditRecorder({ audit: auditRepo, clock, ids: new FakeIdGenerator('log') }),
		clock
	});
	return { service, apiKeys, settings, auditRepo };
}

describe('ApiKeyAdminService.listKeys', () => {
	test('メタ情報を返し、秘匿値(keyHash)は含まれない(AC-ADMIN-008)', async () => {
		const { service } = setup();
		const list = await service.listKeys(SUPER);
		expect(list[0]).not.toHaveProperty('keyHash');
		expect(list[0].scope).toBe('read');
	});
});

describe('ApiKeyAdminService.revokeKey', () => {
	test('moderator はキーを失効でき監査に残る', async () => {
		const { service, apiKeys, auditRepo } = setup();
		await service.revokeKey(MOD, 'k1');
		expect((await apiKeys.listMeta())[0].status).toBe('revoked');
		expect(auditRepo.records[0].eventType).toBe('api_key.revoked');
	});

	test('存在しないキーは NotFound', async () => {
		const { service } = setup();
		await expect(service.revokeKey(MOD, 'missing')).rejects.toThrow(NotFoundError);
	});
});

describe('ApiKeyAdminService.setRateLimit', () => {
	test('super_admin が 60→120 に変更でき差分が監査に残る(AC-ADMIN-009)', async () => {
		const { service, settings, auditRepo } = setup([], 60);
		await service.setRateLimit(SUPER, 120);
		expect(await settings.getApiRateLimitPerMinute()).toBe(120);
		expect(auditRepo.records[0].eventType).toBe('api.rate_limit_changed');
		expect(auditRepo.records[0].metadata).toEqual({ from: 60, to: 120 });
	});

	test('moderator はしきい値を変更できない', async () => {
		const { service } = setup();
		await expect(service.setRateLimit(MOD, 120)).rejects.toThrow(ForbiddenError);
	});

	test('不正な値は ValidationError', async () => {
		const { service } = setup();
		await expect(service.setRateLimit(SUPER, 0)).rejects.toThrow(ValidationError);
	});
});
