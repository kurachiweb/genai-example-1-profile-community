// AdminWebauthnCredentialRepository(Gateway)の MikroORM 実装。
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import {
	AdminWebauthnCredentialRecord,
	AdminWebauthnCredentialRepository
} from '../../application/admin/gateways';
import { AdminWebauthnCredentialEntity } from './entities/admin-webauthn-credential.entity';

function toRecord(entity: AdminWebauthnCredentialEntity): AdminWebauthnCredentialRecord {
	return {
		id: entity.id,
		adminAccountId: entity.adminAccountId,
		credentialId: entity.credentialId,
		publicKey: entity.publicKey,
		signCount: entity.signCount ?? 0,
		transports: entity.transports,
		aaguid: entity.aaguid,
		nickname: entity.nickname,
		lastUsedAt: entity.lastUsedAt,
		createdAt: entity.createdAt as Date
	};
}

@Injectable()
export class MikroAdminWebauthnCredentialRepository implements AdminWebauthnCredentialRepository {
	constructor(private readonly em: EntityManager) {}

	async listByAdmin(adminAccountId: string): Promise<AdminWebauthnCredentialRecord[]> {
		const entities = await this.em
			.fork()
			.find(AdminWebauthnCredentialEntity, { adminAccountId }, { orderBy: { createdAt: 'asc' } });
		return entities.map(toRecord);
	}

	async findByCredentialId(credentialId: string): Promise<AdminWebauthnCredentialRecord | null> {
		const entity = await this.em.fork().findOne(AdminWebauthnCredentialEntity, { credentialId });
		return entity ? toRecord(entity) : null;
	}

	async save(record: AdminWebauthnCredentialRecord): Promise<void> {
		const em = this.em.fork();
		const entity = em.create(AdminWebauthnCredentialEntity, {
			id: record.id,
			adminAccountId: record.adminAccountId,
			credentialId: record.credentialId,
			publicKey: record.publicKey,
			signCount: record.signCount,
			transports: record.transports,
			aaguid: record.aaguid,
			nickname: record.nickname,
			lastUsedAt: record.lastUsedAt
		});
		await em.persist(entity).flush();
	}

	async updateSignCount(id: string, signCount: number, lastUsedAt: Date): Promise<void> {
		const em = this.em.fork();
		const entity = await em.findOne(AdminWebauthnCredentialEntity, { id });
		if (entity) {
			entity.signCount = signCount;
			entity.lastUsedAt = lastUsedAt;
			await em.flush();
		}
	}

	async delete(id: string, adminAccountId: string): Promise<void> {
		const em = this.em.fork();
		await em.nativeDelete(AdminWebauthnCredentialEntity, { id, adminAccountId });
	}
}
