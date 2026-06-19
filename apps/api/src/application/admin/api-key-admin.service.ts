// 公開 API キー運用と共通レート制限しきい値のユースケース(BR-ADMIN-007/008・US-0707)。
// キーの秘匿値は扱わずメタ情報のみ。失効・しきい値変更は監査に記録する。
import { AdminPermission, assertCan } from '../../domain/admin-role';
import { AuditActorType, AuditEventType } from '../../domain/audit-event';
import { NotFoundError } from '../../domain/errors';
import { assertValidRateLimit } from '../../domain/rate-limit';
import { Clock } from '../gateways';
import { AuditRecorder } from './audit-recorder';
import { ApiKeyAdminRepository, SettingsRepository } from './gateways';
import { AdminPrincipal, ApiKeyMeta } from './models';

export interface ApiKeyAdminServiceDeps {
	readonly apiKeys: ApiKeyAdminRepository;
	readonly settings: SettingsRepository;
	readonly audit: AuditRecorder;
	readonly clock: Clock;
}

export class ApiKeyAdminService {
	constructor(private readonly deps: ApiKeyAdminServiceDeps) {}

	/** 発行済みキーのメタ情報一覧(秘匿値は含めない、AC-ADMIN-008)。 */
	async listKeys(actor: AdminPrincipal): Promise<ApiKeyMeta[]> {
		assertCan(actor.role, AdminPermission.VIEW_API_KEYS);
		return this.deps.apiKeys.listMeta();
	}

	/** 濫用が疑われるキーを失効する(US-0707)。失効は監査に記録する。 */
	async revokeKey(actor: AdminPrincipal, keyId: string): Promise<void> {
		assertCan(actor.role, AdminPermission.API_KEY_REVOKE);
		const meta = await this.deps.apiKeys.findMetaById(keyId);
		if (!meta) {
			throw new NotFoundError('対象の API キーが見つかりません。');
		}
		await this.deps.apiKeys.revoke(keyId, this.deps.clock.now());
		await this.deps.audit.record({
			eventType: AuditEventType.API_KEY_REVOKED,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'api_key',
			targetId: keyId,
			metadata: { userId: meta.userId }
		});
	}

	async getRateLimit(actor: AdminPrincipal): Promise<number> {
		assertCan(actor.role, AdminPermission.VIEW_API_KEYS);
		return this.deps.settings.getApiRateLimitPerMinute();
	}

	/** 共通レート制限しきい値を変更する(super_admin のみ、AC-ADMIN-009)。 */
	async setRateLimit(actor: AdminPrincipal, value: number): Promise<number> {
		assertCan(actor.role, AdminPermission.API_RATE_LIMIT_UPDATE);
		assertValidRateLimit(value);
		const previous = await this.deps.settings.getApiRateLimitPerMinute();
		await this.deps.settings.setApiRateLimitPerMinute(value);
		await this.deps.audit.record({
			eventType: AuditEventType.API_RATE_LIMIT_CHANGED,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'settings',
			targetId: 'api_rate_limit',
			metadata: { from: previous, to: value }
		});
		return value;
	}
}
