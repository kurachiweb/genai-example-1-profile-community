// UserRepository(Gateway)の MikroORM 実装(Interface Adapters)。
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import {
	ProfileCreateInput,
	UserCreateInput,
	UserRepository,
	UserUpdateInput
} from '../../application/gateways';
import { UserRecord } from '../../application/models';
import { UserStatus } from '../../domain/user-status';
import { ProfileEntity } from './entities/profile.entity';
import { UserEntity } from './entities/user.entity';
import { toUserRecord } from './mappers';

@Injectable()
export class MikroUserRepository implements UserRepository {
	constructor(private readonly em: EntityManager) {}

	async findById(id: string, isIncludeDeleted = false): Promise<UserRecord | null> {
		const em = this.em.fork();
		const entity = await em.findOne(UserEntity, {
			id,
			...(isIncludeDeleted ? {} : { status: { $ne: UserStatus.WITHDRAWN } })
		});
		return entity ? toUserRecord(entity) : null;
	}

	async findByEmailNormalized(
		emailNormalized: string,
		isIncludeDeleted = false
	): Promise<UserRecord | null> {
		const em = this.em.fork();
		const entity = await em.findOne(UserEntity, {
			emailNormalized,
			...(isIncludeDeleted ? {} : { status: { $ne: UserStatus.WITHDRAWN } })
		});
		return entity ? toUserRecord(entity) : null;
	}

	async getPasswordHash(userId: string, isIncludeDeleted = false): Promise<string | null> {
		const em = this.em.fork();
		const entity = await em.findOne(
			UserEntity,
			{
				id: userId,
				...(isIncludeDeleted ? {} : { status: { $ne: UserStatus.WITHDRAWN } })
			},
			{ fields: ['passwordHash'] }
		);
		return entity?.passwordHash ?? null;
	}

	async createWithProfile(user: UserCreateInput, profile: ProfileCreateInput): Promise<void> {
		const em = this.em.fork();
		const now = new Date();
		const userEntity = em.create(UserEntity, {
			id: user.id,
			email: user.email,
			emailNormalized: user.emailNormalized,
			passwordHash: user.passwordHash,
			status: user.status,
			emailVerifiedAt: null,
			createdAt: now,
			updatedAt: now
		});
		// NameDisplayOrder.GIVEN_FIRST が既定('given_first')。
		em.create(ProfileEntity, {
			id: profile.id,
			user: userEntity,
			handle: profile.handle,
			createdAt: now,
			updatedAt: now
		});
		em.persist(userEntity);
		await em.flush();
	}

	async update(userId: string, changes: UserUpdateInput): Promise<void> {
		const em = this.em.fork();
		const entity = await em.findOne(UserEntity, { id: userId });
		if (!entity) return;

		if (changes.status !== undefined) entity.status = changes.status;
		if (changes.emailVerifiedAt !== undefined) entity.emailVerifiedAt = changes.emailVerifiedAt;
		if (changes.passwordHash !== undefined) entity.passwordHash = changes.passwordHash;
		if (changes.email !== undefined) entity.email = changes.email;
		if (changes.emailNormalized !== undefined) entity.emailNormalized = changes.emailNormalized;
		if (changes.sessionEpoch !== undefined) entity.sessionEpoch = changes.sessionEpoch;

		await em.flush();
	}
}
