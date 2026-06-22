// Gateway(データアクセス・外部依存のインターフェース)を Use Case 層で宣言する(clean-architecture Step 3)。
// 実装(MikroORM リポジトリ・時計・ID 生成)は Interface Adapters/Frameworks 側で束ねる(DI トークンで結線)。
import { ProfileCursor } from '../domain/cursor';
import { ProfileRecord, SnsLinkRecord, UserRecord } from './models';

export const USER_REPOSITORY = Symbol('UserRepository');

export interface UserCreateInput {
	readonly id: string;
	readonly email: string;
	readonly emailNormalized: string;
	readonly passwordHash: string;
	readonly status: UserRecord['status'];
}

export interface ProfileCreateInput {
	readonly id: string;
	readonly userId: string;
	readonly handle: string;
}

export interface UserUpdateInput {
	readonly status?: UserRecord['status'];
	readonly emailVerifiedAt?: Date | null;
	readonly passwordHash?: string;
	readonly email?: string;
	readonly emailNormalized?: string;
	readonly sessionEpoch?: number;
}

export interface UserRepository {
	findById(id: string): Promise<UserRecord | null>;
	findByEmailNormalized(emailNormalized: string): Promise<UserRecord | null>;
	/** ユーザー＋プロフィールをトランザクションで作成する(登録時専用)。 */
	createWithProfile(user: UserCreateInput, profile: ProfileCreateInput): Promise<void>;
	/** パスワードハッシュを取得する(認証用・ユーザーレコードに含めない)。 */
	getPasswordHash(userId: string): Promise<string | null>;
	/** フィールドを部分更新する(パスワード変更・メール変更・状態変更等)。 */
	update(userId: string, changes: UserUpdateInput): Promise<void>;
}

export const PROFILE_REPOSITORY = Symbol('ProfileRepository');

export interface ProfileListFilter {
	/** 氏名・職業・自己紹介の中間一致(NFC 正規化・ケースフォールド比較、BR-DISC-004)。 */
	readonly search?: string;
	/** 取得件数(既定/最大は呼び出し側で確定済み)。1 件多く取り hasMore を判定する。 */
	readonly limit: number;
	/** キーセットページングのカーソル(未指定なら先頭ページ)。 */
	readonly cursor?: ProfileCursor;
}

export interface ProfileListOffsetFilter {
	readonly search?: string;
	readonly limit: number;
	readonly offset: number;
}

export interface ProfileListOffsetResult {
	readonly profiles: readonly ProfileRecord[];
	readonly total: number;
}

export interface ProfileRepository {
	findByUserId(userId: string): Promise<ProfileRecord | null>;
	findByHandle(handle: string): Promise<ProfileRecord | null>;
	/**
	 * 実効公開(owner ACTIVE かつ visibility public)のプロフィールのみを (updated_at desc, id desc) で取得する。
	 * 除外行は SQL の段階で確実に落とす(取得後フィルタの漏れを作らない、mikroorm §5)。
	 */
	listEffectivePublic(filter: ProfileListFilter): Promise<ProfileRecord[]>;
	/** オフセットページング方式。client の一覧・検索ページで使用する。 */
	listEffectivePublicOffset(filter: ProfileListOffsetFilter): Promise<ProfileListOffsetResult>;
	save(profile: ProfileRecord): Promise<void>;
}

export const SNS_LINK_REPOSITORY = Symbol('SnsLinkRepository');

export interface SnsLinkRepository {
	/** DataLoader バッチ用。複数 profileId のリンクをまとめて取得する(N+1 回避)。 */
	findByProfileIds(profileIds: readonly string[]): Promise<SnsLinkRecord[]>;
	/** 当該プロフィールのリンクを全置換する(0〜10 件)。 */
	replaceForProfile(profileId: string, links: readonly SnsLinkRecord[]): Promise<void>;
}

export const CLOCK = Symbol('Clock');

export interface Clock {
	now(): Date;
}

export const ID_GENERATOR = Symbol('IdGenerator');

export interface IdGenerator {
	/** ULID(26 文字・生成時刻順)を発行する(db §4)。 */
	ulid(): string;
}
