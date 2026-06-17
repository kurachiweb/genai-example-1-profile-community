// ApiKeyRepository(Gateway)の MikroORM 実装(Interface Adapters)。
// 認証のためのハッシュ照合と最終利用日時更新のみを担う(発行/失効 UI は client/admin 側・範囲外)。
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { ApiKeyRepository } from '../../application/gateways';
import { ApiKeyRecord } from '../../application/models';
import { ApiKeyEntity } from './entities/api-key.entity';
import { toApiKeyRecord } from './mappers';

@Injectable()
export class MikroApiKeyRepository implements ApiKeyRepository {
	constructor(private readonly em: EntityManager) {}

	async findByKeyHash(keyHash: string): Promise<ApiKeyRecord | null> {
		const em = this.em.fork();
		const entity = await em.findOne(ApiKeyEntity, { keyHash });
		return entity ? toApiKeyRecord(entity) : null;
	}

	async touchLastUsed(keyId: string, usedAt: Date): Promise<void> {
		const em = this.em.fork();
		// 認証成功の副作用。存在しない場合は何もしない(レース時の安全側)。
		await em.nativeUpdate(ApiKeyEntity, { id: keyId }, { lastUsedAt: usedAt });
	}
}
