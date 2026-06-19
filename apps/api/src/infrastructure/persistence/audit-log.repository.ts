// AuditLogRepository(Gateway)の MikroORM 実装。追記専用(append のみ)。
import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { AuditLogRecord } from '../../domain/audit-event';
import { AuditLogRepository } from '../../application/admin/gateways';
import { AuditLogQuery, AuditLogView } from '../../application/admin/models';
import { AuditLogEntity } from './entities/audit-log.entity';

function toView(entity: AuditLogEntity): AuditLogView {
	return {
		id: entity.id,
		eventType: entity.eventType,
		actorType: entity.actorType,
		actorId: entity.actorId,
		targetType: entity.targetType,
		targetId: entity.targetId,
		result: entity.result as AuditLogView['result'],
		metadata: entity.metadata ? (JSON.parse(entity.metadata) as Record<string, unknown>) : null,
		occurredAt: entity.occurredAt as Date
	};
}

@Injectable()
export class MikroAuditLogRepository implements AuditLogRepository {
	constructor(private readonly em: EntityManager) {}

	async append(record: AuditLogRecord): Promise<void> {
		const em = this.em.fork();
		const entity = em.create(AuditLogEntity, {
			id: record.id,
			eventType: record.eventType,
			actorType: record.actorType,
			actorId: record.actorId,
			targetType: record.targetType,
			targetId: record.targetId,
			result: record.result,
			metadata: record.metadata ? JSON.stringify(record.metadata) : null,
			occurredAt: record.occurredAt
		});
		await em.persist(entity).flush();
	}

	async list(query: AuditLogQuery): Promise<{ logs: AuditLogView[]; total: number }> {
		const em = this.em.fork();
		const where: FilterQuery<AuditLogEntity> = {};
		if (query.actorType) {
			where.actorType = query.actorType;
		}
		if (query.eventType) {
			where.eventType = query.eventType;
		}
		if (query.targetId) {
			where.targetId = query.targetId;
		}
		const [entities, total] = await em.findAndCount(AuditLogEntity, where, {
			orderBy: { occurredAt: 'desc' },
			limit: query.limit,
			offset: query.offset
		});
		return { logs: entities.map(toView), total };
	}
}
