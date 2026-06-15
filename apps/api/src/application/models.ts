// 境界をまたぐプレーンデータ構造(Request/Response Model)。
// MikroORM エンティティでも GraphQL 型でもない。Use Cases/Entities が扱う中立な形(clean-architecture)。
import { NameDisplayOrder } from '../domain/display-name';
import { Visibility } from '../domain/effective-public';
import { SnsPlatform } from '../domain/sns-link';
import { UserStatus } from '../domain/user-status';

export interface UserRecord {
	readonly id: string;
	readonly status: UserStatus;
}

export interface ProfileRecord {
	readonly id: string;
	readonly userId: string;
	readonly handle: string;
	readonly visibility: Visibility;
	readonly iconImageId: string | null;
	readonly firstName: string;
	readonly lastName: string;
	readonly nameDisplayOrder: NameDisplayOrder;
	readonly occupation: string | null;
	readonly searchName: string | null;
	readonly bio: string | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export interface SnsLinkRecord {
	readonly id: string;
	readonly profileId: string;
	readonly platform: SnsPlatform;
	readonly url: string;
	readonly label: string | null;
	readonly sortOrder: number;
	readonly createdAt: Date;
}

/** プロフィールと所有者状態の組(実効公開ゲートの評価に用いる)。 */
export interface ProfileWithOwner {
	readonly profile: ProfileRecord;
	readonly ownerStatus: UserStatus;
}

/** リクエストごとに解決される閲覧者(Cookie セッション由来、BR-COMMON-001)。 */
export interface Viewer {
	readonly userId: string;
	readonly status: UserStatus;
}
