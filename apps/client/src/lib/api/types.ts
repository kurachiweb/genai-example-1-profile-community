// 内部 GraphQL(api)の利用者サーフェスに対応する型。生成器導入までは手書きで整合させる。
export type UserStatus = 'UNVERIFIED' | 'ACTIVE' | 'FROZEN' | 'WITHDRAWN';
export type ProfileVisibility = 'PUBLIC' | 'PRIVATE';
export type ApiKeyScope = 'read' | 'full';
export type ApiKeyStatus = 'ACTIVE' | 'REVOKED';
export type SnsLinkPlatform =
	| 'X'
	| 'INSTAGRAM'
	| 'FACEBOOK'
	| 'LINKEDIN'
	| 'GITHUB'
	| 'YOUTUBE'
	| 'TIKTOK'
	| 'WEBSITE';

export interface Me {
	readonly userId: string;
	readonly email: string;
	readonly status: UserStatus;
	readonly emailVerifiedAt: string | null;
}

export interface SnsLink {
	readonly id: string;
	readonly platform: SnsLinkPlatform;
	readonly url: string;
	readonly displayOrder: number;
}

export interface MyProfile {
	readonly userId: string;
	readonly handle: string | null;
	readonly visibility: ProfileVisibility;
	readonly firstName: string | null;
	readonly lastName: string | null;
	readonly occupation: string | null;
	readonly bio: string | null;
	readonly iconUrl: string | null;
	readonly snsLinks: readonly SnsLink[];
	readonly updatedAt: string;
}

export interface PublicProfile {
	readonly handle: string;
	readonly firstName: string | null;
	readonly lastName: string | null;
	readonly occupation: string | null;
	readonly bio: string | null;
	readonly iconUrl: string | null;
	readonly snsLinks: readonly SnsLink[];
}

export interface PublicProfileSummary {
	readonly handle: string;
	readonly firstName: string | null;
	readonly lastName: string | null;
	readonly occupation: string | null;
	readonly bio: string | null;
	readonly iconUrl: string | null;
}

export interface PublicProfileConnection {
	readonly profiles: readonly PublicProfileSummary[];
	readonly total: number;
}

export interface ApiKey {
	readonly id: string;
	readonly label: string | null;
	readonly scope: ApiKeyScope;
	readonly status: ApiKeyStatus;
	readonly lastUsedAt: string | null;
	readonly createdAt: string;
}

export interface CreatedApiKey extends ApiKey {
	readonly rawKey: string;
}
