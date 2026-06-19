// モデレーション系 Gateway(Suspension/Unfreeze/Report)の MikroORM 実装。
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { ReportStatus, SuspensionStatus, UnfreezeRequestStatus } from '../../domain/moderation';
import {
	ReportRepository,
	SuspensionRepository,
	UnfreezeRequestRepository
} from '../../application/admin/gateways';
import {
	ReportRecord,
	SuspensionRecord,
	UnfreezeRequestRecord
} from '../../application/admin/models';
import { ReportEntity } from './entities/report.entity';
import { SuspensionEntity } from './entities/suspension.entity';
import { UnfreezeRequestEntity } from './entities/unfreeze-request.entity';

@Injectable()
export class MikroSuspensionRepository implements SuspensionRepository {
	constructor(private readonly em: EntityManager) {}

	async create(record: SuspensionRecord): Promise<void> {
		const em = this.em.fork();
		const entity = em.create(SuspensionEntity, {
			id: record.id,
			userId: record.userId,
			reasonCategory: record.reasonCategory,
			status: record.status,
			suspendedBy: record.suspendedBy,
			suspendedAt: record.suspendedAt,
			liftedAt: record.liftedAt
		});
		await em.persist(entity).flush();
	}

	async findActiveByUserId(userId: string): Promise<SuspensionRecord | null> {
		const entity = await this.em
			.fork()
			.findOne(SuspensionEntity, { userId, status: SuspensionStatus.ACTIVE });
		if (!entity) {
			return null;
		}
		return {
			id: entity.id,
			userId: entity.userId,
			reasonCategory: entity.reasonCategory,
			status: entity.status ?? SuspensionStatus.ACTIVE,
			suspendedBy: entity.suspendedBy,
			suspendedAt: entity.suspendedAt as Date,
			liftedAt: entity.liftedAt
		};
	}

	async setStatus(id: string, status: SuspensionStatus, liftedAt: Date | null): Promise<void> {
		const em = this.em.fork();
		const entity = await em.findOne(SuspensionEntity, { id });
		if (entity) {
			entity.status = status;
			entity.liftedAt = liftedAt;
			await em.flush();
		}
	}
}

function toUnfreezeRecord(entity: UnfreezeRequestEntity): UnfreezeRequestRecord {
	return {
		id: entity.id,
		userId: entity.userId,
		suspensionId: entity.suspensionId,
		reason: entity.reason,
		supplement: entity.supplement,
		status: entity.status ?? UnfreezeRequestStatus.PENDING,
		reviewedBy: entity.reviewedBy,
		createdAt: entity.createdAt as Date,
		reviewedAt: entity.reviewedAt
	};
}

@Injectable()
export class MikroUnfreezeRequestRepository implements UnfreezeRequestRepository {
	constructor(private readonly em: EntityManager) {}

	async list(status?: UnfreezeRequestStatus): Promise<UnfreezeRequestRecord[]> {
		const entities = await this.em
			.fork()
			.find(UnfreezeRequestEntity, status ? { status } : {}, { orderBy: { createdAt: 'desc' } });
		return entities.map(toUnfreezeRecord);
	}

	async findById(id: string): Promise<UnfreezeRequestRecord | null> {
		const entity = await this.em.fork().findOne(UnfreezeRequestEntity, { id });
		return entity ? toUnfreezeRecord(entity) : null;
	}

	async setReviewed(
		id: string,
		status: UnfreezeRequestStatus,
		reviewedBy: string,
		reviewedAt: Date
	): Promise<void> {
		const em = this.em.fork();
		const entity = await em.findOne(UnfreezeRequestEntity, { id });
		if (entity) {
			entity.status = status;
			entity.reviewedBy = reviewedBy;
			entity.reviewedAt = reviewedAt;
			await em.flush();
		}
	}

	async countByStatus(status: UnfreezeRequestStatus): Promise<number> {
		return this.em.fork().count(UnfreezeRequestEntity, { status });
	}
}

function toReportRecord(entity: ReportEntity): ReportRecord {
	return {
		id: entity.id,
		targetUserId: entity.targetUserId,
		targetHandle: entity.targetHandle,
		reasonCategory: entity.reasonCategory,
		detail: entity.detail,
		status: entity.status ?? ReportStatus.OPEN,
		duplicateCount: entity.duplicateCount ?? 1,
		createdAt: entity.createdAt as Date,
		updatedAt: entity.updatedAt as Date
	};
}

@Injectable()
export class MikroReportRepository implements ReportRepository {
	constructor(private readonly em: EntityManager) {}

	async list(status?: ReportStatus): Promise<ReportRecord[]> {
		const entities = await this.em
			.fork()
			.find(ReportEntity, status ? { status } : {}, { orderBy: { createdAt: 'desc' } });
		return entities.map(toReportRecord);
	}

	async findById(id: string): Promise<ReportRecord | null> {
		const entity = await this.em.fork().findOne(ReportEntity, { id });
		return entity ? toReportRecord(entity) : null;
	}

	async setStatus(id: string, status: ReportStatus, updatedAt: Date): Promise<void> {
		const em = this.em.fork();
		const entity = await em.findOne(ReportEntity, { id });
		if (entity) {
			entity.status = status;
			entity.updatedAt = updatedAt;
			await em.flush();
		}
	}

	async countByStatus(status: ReportStatus): Promise<number> {
		return this.em.fork().count(ReportEntity, { status });
	}
}
