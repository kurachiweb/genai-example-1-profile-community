// ApiKeyAdminRepository(Gateway)の MikroORM 実装。メタ情報のみ扱い、keyHash は返さない(BR-ADMIN-007)。
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { ApiKeyAdminRepository } from '../../application/admin/gateways';
import { ApiKeyMeta } from '../../application/admin/models';
import { ApiKeyEntity } from './entities/api-key.entity';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class MikroApiKeyAdminRepository implements ApiKeyAdminRepository {
	constructor(private readonly em: EntityManager) {}

	private async toMeta(em: EntityManager, entity: ApiKeyEntity): Promise<ApiKeyMeta> {
		const owner = await em.findOne(UserEntity, { id: entity.userId }, { fields: ['email'] });
		return {
			id: entity.id,
			userId: entity.userId,
			ownerEmail: owner?.email ?? null,
			label: entity.label,
			scope: entity.scope,
			status: entity.status ?? 'active',
			lastUsedAt: entity.lastUsedAt,
			createdAt: entity.createdAt as Date,
			revokedAt: entity.revokedAt
		};
	}

	async listMeta(): Promise<ApiKeyMeta[]> {
		const em = this.em.fork();
		const entities = await em.find(ApiKeyEntity, {}, { orderBy: { createdAt: 'desc' } });
		return Promise.all(entities.map((entity) => this.toMeta(em, entity)));
	}

	async findMetaById(id: string): Promise<ApiKeyMeta | null> {
		const em = this.em.fork();
		const entity = await em.findOne(ApiKeyEntity, { id });
		return entity ? this.toMeta(em, entity) : null;
	}

	async revoke(id: string, revokedAt: Date): Promise<void> {
		const em = this.em.fork();
		const entity = await em.findOne(ApiKeyEntity, { id });
		if (entity) {
			entity.status = 'revoked';
			entity.revokedAt = revokedAt;
			await em.flush();
		}
	}

	async revokeAllForUser(userId: string, revokedAt: Date): Promise<void> {
		const em = this.em.fork();
		await em.nativeUpdate(
			ApiKeyEntity,
			{ userId, status: 'active' },
			{ status: 'revoked', revokedAt }
		);
	}

	async countActive(): Promise<number> {
		return this.em.fork().count(ApiKeyEntity, { status: 'active' });
	}
}
