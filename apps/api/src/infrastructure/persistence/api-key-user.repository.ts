// UserApiKeyRepository(Gateway)の MikroORM 実装(利用者向け)。
// 秘匿値(keyHash)は取得しない(BR-API-001)。発行時のみ入力として受け取る。
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { ApiKeyRecord, UserApiKeyRepository } from '../../application/user.service';
import { ApiKeyEntity } from './entities/api-key.entity';

@Injectable()
export class MikroUserApiKeyRepository implements UserApiKeyRepository {
	constructor(private readonly em: EntityManager) {}

	async findActiveByUserId(userId: string): Promise<ApiKeyRecord[]> {
		const em = this.em.fork();
		const entities = await em.find(
			ApiKeyEntity,
			{ userId, status: 'active' },
			{ orderBy: { createdAt: 'desc' } }
		);
		return entities.map((e) => ({
			id: e.id,
			userId: e.userId,
			label: e.label,
			scope: e.scope as ApiKeyRecord['scope'],
			status: e.status ?? 'active',
			lastUsedAt: e.lastUsedAt,
			createdAt: e.createdAt as Date,
			revokedAt: e.revokedAt
		}));
	}

	async create(record: ApiKeyRecord & { keyHash: string }): Promise<void> {
		const em = this.em.fork();
		const entity = em.create(ApiKeyEntity, {
			id: record.id,
			userId: record.userId,
			keyHash: record.keyHash,
			label: record.label,
			scope: record.scope,
			status: 'active',
			lastUsedAt: null,
			createdAt: record.createdAt,
			revokedAt: null
		});
		em.persist(entity);
		await em.flush();
	}

	async revoke(id: string, userId: string, revokedAt: Date): Promise<void> {
		const em = this.em.fork();
		const entity = await em.findOne(ApiKeyEntity, { id, userId, status: 'active' });
		if (entity) {
			entity.status = 'revoked';
			entity.revokedAt = revokedAt;
			await em.flush();
		}
	}
}
