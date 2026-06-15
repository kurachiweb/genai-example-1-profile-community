// SnsLinkRepository(Gateway)の MikroORM 実装(Interface Adapters)。
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { SnsLinkRepository } from '../../application/gateways';
import { SnsLinkRecord } from '../../application/models';
import { ProfileEntity } from './entities/profile.entity';
import { SnsLinkEntity } from './entities/sns-link.entity';
import { toSnsLinkRecord } from './mappers';

@Injectable()
export class MikroSnsLinkRepository implements SnsLinkRepository {
  constructor(private readonly em: EntityManager) {}

  async findByProfileIds(profileIds: readonly string[]): Promise<SnsLinkRecord[]> {
    if (profileIds.length === 0) {
      return [];
    }
    const em = this.em.fork();
    const entities = await em.find(
      SnsLinkEntity,
      { profile: { $in: [...profileIds] } },
      { orderBy: { sortOrder: 'asc' } },
    );
    return entities.map(toSnsLinkRecord);
  }

  async replaceForProfile(profileId: string, links: readonly SnsLinkRecord[]): Promise<void> {
    const em = this.em.fork();
    // 全置換は単一トランザクションで原子的に行う(削除 → 追加、mikroorm §4)。
    await em.transactional(async (tx) => {
      await tx.nativeDelete(SnsLinkEntity, { profile: profileId });
      const profileRef = tx.getReference(ProfileEntity, profileId);
      for (const link of links) {
        tx.persist(
          tx.create(SnsLinkEntity, {
            id: link.id,
            profile: profileRef,
            platform: link.platform,
            url: link.url,
            label: link.label,
            sortOrder: link.sortOrder,
            createdAt: link.createdAt,
          }),
        );
      }
    });
  }
}
