// Gateway(データアクセス・外部依存のインターフェース)を Use Case 層で宣言する(clean-architecture Step 3)。
// 実装(MikroORM リポジトリ・時計・ID 生成)は Interface Adapters/Frameworks 側で束ねる(DI トークンで結線)。
import { ProfileCursor } from '../domain/cursor';
import { ProfileRecord, SnsLinkRecord, UserRecord } from './models';

export const USER_REPOSITORY = Symbol('UserRepository');

export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
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

export interface ProfileRepository {
  findByUserId(userId: string): Promise<ProfileRecord | null>;
  findByHandle(handle: string): Promise<ProfileRecord | null>;
  /**
   * 実効公開(owner ACTIVE かつ visibility public)のプロフィールのみを (updated_at desc, id desc) で取得する。
   * 除外行は SQL の段階で確実に落とす(取得後フィルタの漏れを作らない、mikroorm §5)。
   */
  listEffectivePublic(filter: ProfileListFilter): Promise<ProfileRecord[]>;
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
