// UserRepository(Gateway)の MikroORM 実装(Interface Adapters)。
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../application/gateways';
import { UserRecord } from '../../application/models';
import { UserEntity } from './entities/user.entity';
import { toUserRecord } from './mappers';

@Injectable()
export class MikroUserRepository implements UserRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<UserRecord | null> {
    // リクエストをまたいで Identity Map を共有しないよう fork する(mikroorm §3)。
    const em = this.em.fork();
    const entity = await em.findOne(UserEntity, { id });
    return entity ? toUserRecord(entity) : null;
  }
}
