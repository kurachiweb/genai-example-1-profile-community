// ProfileRepository(Gateway)の MikroORM 実装(Interface Adapters)。
// 実効公開で除外される行は SQL 段階で確実に落とす(取得後フィルタの漏れを作らない、mikroorm §5)。
import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Visibility } from '../../domain/effective-public';
import { UserStatus } from '../../domain/user-status';
import { ProfileListFilter, ProfileRepository } from '../../application/gateways';
import { ProfileRecord } from '../../application/models';
import { ProfileEntity } from './entities/profile.entity';
import { UserEntity } from './entities/user.entity';
import { toProfileRecord } from './mappers';

@Injectable()
export class MikroProfileRepository implements ProfileRepository {
	constructor(private readonly em: EntityManager) {}

	async findByUserId(userId: string): Promise<ProfileRecord | null> {
		const em = this.em.fork();
		const entity = await em.findOne(ProfileEntity, { user: userId });
		return entity ? toProfileRecord(entity) : null;
	}

	async findByHandle(handle: string): Promise<ProfileRecord | null> {
		const em = this.em.fork();
		const entity = await em.findOne(ProfileEntity, { handle });
		return entity ? toProfileRecord(entity) : null;
	}

	async listEffectivePublic(filter: ProfileListFilter): Promise<ProfileRecord[]> {
		const em = this.em.fork();
		const conditions: FilterQuery<ProfileEntity>[] = [
			// 実効公開: visibility=public かつ owner.status=ACTIVE(リレーション条件で JOIN される)。
			{ visibility: Visibility.PUBLIC },
			{ user: { status: UserStatus.ACTIVE } }
		];

		if (filter.cursor) {
			// キーセット: (updated_at, id) が降順カーソルより「後ろ」の行のみ。
			const cursorDate = new Date(filter.cursor.updatedAt);
			conditions.push({
				$or: [
					{ updatedAt: { $lt: cursorDate } },
					{ updatedAt: cursorDate, id: { $lt: filter.cursor.id } }
				]
			});
		}

		const entities = await em.find(
			ProfileEntity,
			{ $and: conditions },
			{ orderBy: { updatedAt: 'desc', id: 'desc' }, limit: filter.limit }
		);
		return entities.map(toProfileRecord);
	}

	async save(profile: ProfileRecord): Promise<void> {
		const em = this.em.fork();
		const existing = await em.findOne(ProfileEntity, { id: profile.id });
		if (existing) {
			em.assign(existing, {
				handle: profile.handle,
				visibility: profile.visibility,
				iconImageId: profile.iconImageId,
				firstName: profile.firstName,
				lastName: profile.lastName,
				nameDisplayOrder: profile.nameDisplayOrder,
				occupation: profile.occupation,
				searchName: profile.searchName,
				bio: profile.bio,
				updatedAt: profile.updatedAt
			});
			await em.flush();
			return;
		}

		const entity = em.create(ProfileEntity, {
			id: profile.id,
			user: em.getReference(UserEntity, profile.userId),
			handle: profile.handle,
			visibility: profile.visibility,
			iconImageId: profile.iconImageId,
			firstName: profile.firstName,
			lastName: profile.lastName,
			nameDisplayOrder: profile.nameDisplayOrder,
			occupation: profile.occupation,
			searchName: profile.searchName,
			bio: profile.bio,
			createdAt: profile.createdAt,
			updatedAt: profile.updatedAt
		});
		// MikroORM 7 は persistAndFlush を廃止。persist().flush() を用いる。
		em.persist(entity);
		await em.flush();
	}
}
