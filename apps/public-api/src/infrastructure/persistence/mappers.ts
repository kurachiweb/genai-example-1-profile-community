// MikroORM エンティティ ↔ ユースケース層のプレーンレコードの変換(Interface Adapters)。
// 管理対象エンティティの参照を層をまたいで配らない(mikroorm §3)。境界では常にレコードへ写す。
import { ApiKeyRecord, ProfileRecord, SnsLinkRecord, UserRecord } from '../../application/models';
import { ApiKeyEntity } from './entities/api-key.entity';
import { ProfileEntity } from './entities/profile.entity';
import { SnsLinkEntity } from './entities/sns-link.entity';
import { UserEntity } from './entities/user.entity';

export function toUserRecord(entity: UserEntity): UserRecord {
	return { id: entity.id, status: entity.status };
}

export function toProfileRecord(entity: ProfileEntity): ProfileRecord {
	return {
		id: entity.id,
		// リレーションは未ロードでも FK 値(PK)を参照できる。
		userId: entity.user.id,
		handle: entity.handle,
		visibility: entity.visibility,
		iconImageId: entity.iconImageId,
		firstName: entity.firstName,
		lastName: entity.lastName,
		nameDisplayOrder: entity.nameDisplayOrder,
		occupation: entity.occupation,
		searchName: entity.searchName,
		bio: entity.bio,
		createdAt: entity.createdAt,
		updatedAt: entity.updatedAt
	};
}

export function toSnsLinkRecord(entity: SnsLinkEntity): SnsLinkRecord {
	return {
		id: entity.id,
		profileId: entity.profile.id,
		platform: entity.platform,
		url: entity.url,
		label: entity.label,
		sortOrder: entity.sortOrder,
		createdAt: entity.createdAt
	};
}

export function toApiKeyRecord(entity: ApiKeyEntity): ApiKeyRecord {
	return {
		id: entity.id,
		userId: entity.user.id,
		scope: entity.scope,
		status: entity.status
	};
}
