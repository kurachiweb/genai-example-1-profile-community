// AdminUserRepository(Gateway)の MikroORM 実装。users と profiles を結合してサマリを構成する。
// 職務上必要な範囲の表示に限る(BR-ADMIN-004)。一覧件数は小さい前提で件数集計は個別に行う。
import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { NameDisplayOrder } from '../../domain/display-name';
import { Visibility } from '../../domain/effective-public';
import { UserStatus } from '../../domain/user-status';
import { AdminUserRepository } from '../../application/admin/gateways';
import { UserListFilter, UserListResult, UserSummary } from '../../application/admin/models';
import { ApiKeyEntity } from './entities/api-key.entity';
import { ProfileEntity } from './entities/profile.entity';
import { ReportEntity } from './entities/report.entity';
import { UserEntity } from './entities/user.entity';

function buildDisplayName(first: string, last: string, order: NameDisplayOrder): string {
	const given = (first ?? '').trim();
	const family = (last ?? '').trim();
	const ordered = order === NameDisplayOrder.FAMILY_FIRST ? [family, given] : [given, family];
	return ordered.filter((part) => part.length > 0).join(' ');
}

@Injectable()
export class MikroAdminUserRepository implements AdminUserRepository {
	constructor(private readonly em: EntityManager) {}

	async list(filter: UserListFilter): Promise<UserListResult> {
		const em = this.em.fork();
		const conditions: FilterQuery<UserEntity>[] = [];
		if (filter.status) {
			conditions.push({ status: filter.status });
		}
		if (filter.search) {
			const q = filter.search.toLowerCase();
			// メール(正規化済み)またはハンドル(profiles)で部分一致。ハンドルは該当 userId を引いて結合する。
			const matchedProfiles = await em.find(
				ProfileEntity,
				{ handle: { $like: `%${q}%` } },
				{ fields: ['user'] }
			);
			const handleUserIds = matchedProfiles.map((profile) => profile.user.id);
			conditions.push({
				$or: [
					{ emailNormalized: { $like: `%${q}%` } },
					...(handleUserIds.length > 0 ? [{ id: { $in: handleUserIds } }] : [])
				]
			});
		}
		const where: FilterQuery<UserEntity> = conditions.length > 0 ? { $and: conditions } : {};

		const [users, total] = await em.findAndCount(UserEntity, where, {
			orderBy: { createdAt: 'desc' },
			limit: filter.limit,
			offset: filter.offset
		});
		const summaries = await Promise.all(users.map((user) => this.toSummary(em, user)));
		return { users: summaries, total };
	}

	async findSummary(userId: string): Promise<UserSummary | null> {
		const em = this.em.fork();
		const user = await em.findOne(UserEntity, { id: userId });
		return user ? this.toSummary(em, user) : null;
	}

	async getStatus(userId: string): Promise<UserStatus | null> {
		const user = await this.em.fork().findOne(UserEntity, { id: userId }, { fields: ['status'] });
		return user ? user.status : null;
	}

	async setStatus(userId: string, status: UserStatus): Promise<void> {
		const em = this.em.fork();
		const user = await em.findOne(UserEntity, { id: userId });
		if (user) {
			user.status = status;
			await em.flush();
		}
	}

	async clearIcon(userId: string): Promise<void> {
		const em = this.em.fork();
		const profile = await em.findOne(ProfileEntity, { user: userId });
		if (profile) {
			profile.iconImageId = null;
			await em.flush();
		}
	}

	async countByStatus(status: UserStatus): Promise<number> {
		return this.em.fork().count(UserEntity, { status });
	}

	async countAll(): Promise<number> {
		return this.em.fork().count(UserEntity, {});
	}

	async countEffectivePublic(): Promise<number> {
		return this.em
			.fork()
			.count(ProfileEntity, { visibility: Visibility.PUBLIC, user: { status: UserStatus.ACTIVE } });
	}

	private async toSummary(em: EntityManager, user: UserEntity): Promise<UserSummary> {
		const profile = await em.findOne(ProfileEntity, { user: user.id });
		const [reportCount, apiKeyCount] = await Promise.all([
			em.count(ReportEntity, { targetUserId: user.id }),
			em.count(ApiKeyEntity, { userId: user.id, status: 'active' })
		]);
		return {
			id: user.id,
			email: user.email,
			handle: profile?.handle ?? null,
			status: user.status,
			visibility: profile?.visibility ?? null,
			displayName: profile
				? buildDisplayName(
						profile.firstName ?? '',
						profile.lastName ?? '',
						(profile.nameDisplayOrder ?? NameDisplayOrder.GIVEN_FIRST) as NameDisplayOrder
					)
				: null,
			createdAt: user.createdAt as Date,
			reportCount,
			apiKeyCount
		};
	}
}
