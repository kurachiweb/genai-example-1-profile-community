// 規約・ポリシーのユースケース(BR-CONTENT-008/009)。版管理・発効は super_admin のみ。過去版は保持する。
import { AdminPermission, assertCan } from '../../domain/admin-role';
import { AuditActorType, AuditEventType } from '../../domain/audit-event';
import { PolicyType } from '../../domain/content';
import { NotFoundError } from '../../domain/errors';
import { Clock, IdGenerator } from '../gateways';
import { AuditRecorder } from './audit-recorder';
import { PolicyRepository } from './content-gateways';
import { PolicyRecord } from './content-models';
import { AdminPrincipal } from './models';

export interface PolicyServiceDeps {
	readonly policies: PolicyRepository;
	readonly audit: AuditRecorder;
	readonly clock: Clock;
	readonly ids: IdGenerator;
}

export interface CreatePolicyVersionInput {
	readonly type: PolicyType;
	readonly bodyMarkdown: string;
	readonly requiresReconsent: boolean;
	readonly effectiveDate: Date;
}

export class PolicyService {
	constructor(private readonly deps: PolicyServiceDeps) {}

	async listByType(actor: AdminPrincipal, type: PolicyType): Promise<PolicyRecord[]> {
		assertCan(actor.role, AdminPermission.VIEW_CONTENT);
		return this.deps.policies.listByType(type);
	}

	async createVersion(
		actor: AdminPrincipal,
		input: CreatePolicyVersionInput
	): Promise<PolicyRecord> {
		assertCan(actor.role, AdminPermission.POLICY_EDIT);
		const version = (await this.deps.policies.maxVersion(input.type)) + 1;
		const record: PolicyRecord = {
			id: this.deps.ids.ulid(),
			type: input.type,
			version,
			bodyMarkdown: input.bodyMarkdown,
			isPublished: false,
			requiresReconsent: input.requiresReconsent,
			effectiveDate: input.effectiveDate,
			editedBy: actor.adminId,
			createdAt: this.deps.clock.now()
		};
		await this.deps.policies.save(record);
		return record;
	}

	/** 新版を発効する。公開中は type ごとに 1 版のみ。旧版は履歴として保持(AC-CONTENT-009)。 */
	async publish(actor: AdminPrincipal, id: string): Promise<PolicyRecord> {
		assertCan(actor.role, AdminPermission.POLICY_PUBLISH);
		const current = await this.deps.policies.findById(id);
		if (!current) {
			throw new NotFoundError('対象のポリシーが見つかりません。');
		}
		await this.deps.policies.publish(id, current.type);
		await this.deps.audit.record({
			eventType: AuditEventType.POLICY_PUBLISHED,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'policy',
			targetId: id,
			metadata: {
				type: current.type,
				version: current.version,
				requiresReconsent: current.requiresReconsent
			}
		});
		return { ...current, isPublished: true };
	}
}
