// 境界をまたぐプレーンデータ構造(Request/Response Model)。
// MikroORM エンティティでも HTTP DTO でもない。Use Cases/Entities が扱う中立な形(clean-architecture)。
import { ApiKeyScope, ApiKeyStatus } from '../domain/api-key';
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

export interface ApiKeyRecord {
	readonly id: string;
	readonly userId: string;
	readonly scope: ApiKeyScope;
	readonly status: ApiKeyStatus;
}

/**
 * 認証済みの API キー保持者(BR-API-001)。`Authorization: Bearer` のハッシュ照合で解決する。
 * userId はキー所有者で、その権限とスコープの範囲で動作する(所有権ベース)。
 */
export interface ApiPrincipal {
	readonly keyId: string;
	readonly userId: string;
	readonly status: UserStatus;
	readonly scope: ApiKeyScope;
}
