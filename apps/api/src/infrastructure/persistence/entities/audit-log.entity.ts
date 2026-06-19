// audit_logs テーブル(db §5.10)。追記専用・改ざん不可。本番では UPDATE/DELETE を DB トリガーで拒否する。
// metadata は JSON 文字列で保存し、秘匿値は含めない(BR-COMMON-014、アプリ層で除去済み)。
import { EntitySchema, Opt } from '@mikro-orm/core';
import { AuditActorType, AuditEventType } from '../../../domain/audit-event';

export class AuditLogEntity {
	id!: string;
	eventType!: AuditEventType;
	actorType!: AuditActorType;
	actorId!: string | null;
	targetType!: string | null;
	targetId!: string | null;
	result!: string;
	metadata!: string | null;
	occurredAt!: Opt<Date>;
}

export const auditLogSchema = new EntitySchema<AuditLogEntity>({
	class: AuditLogEntity,
	tableName: 'audit_logs',
	indexes: [
		{ name: 'idx_audit_logs_occurred', properties: ['occurredAt'] },
		{ name: 'idx_audit_logs_actor', properties: ['actorType', 'actorId'] },
		{ name: 'idx_audit_logs_target', properties: ['targetType', 'targetId'] }
	],
	properties: {
		id: { type: 'string', primary: true },
		eventType: { type: 'string' },
		actorType: { type: 'string' },
		actorId: { type: 'string', nullable: true },
		targetType: { type: 'string', nullable: true },
		targetId: { type: 'string', nullable: true },
		result: { type: 'string' },
		metadata: { type: 'text', nullable: true },
		occurredAt: { type: 'datetime', onCreate: () => new Date() }
	}
});
