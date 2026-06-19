// 管理者コンソール・コンテンツ配信の業務上限値(マジックナンバー回避)。値の正本は features/07・08 と db §5。
// 変更は features/ を更新してから本定数へ反映する。

/** WebAuthn パスキーの表示名(ニックネーム): 最大 50(BR-COMMON-016)。 */
export const PASSKEY_NICKNAME_MAX_GRAPHEMES = 50;

/** お知らせタイトル: 最大 120(db §5.11)。 */
export const ANNOUNCEMENT_TITLE_MAX_GRAPHEMES = 120;

/** 問い合わせ(general): 件名 最大 120・本文 最大 2000(db §5.12)。 */
export const INQUIRY_SUBJECT_MAX_GRAPHEMES = 120;
export const INQUIRY_BODY_MAX_GRAPHEMES = 2000;

/** 通報詳細: 最大 1000(db §5.7)。 */
export const REPORT_DETAIL_MAX_GRAPHEMES = 1000;

/** 解除リクエスト理由: 最大 1000(db §5.8)。 */
export const UNFREEZE_REASON_MAX_GRAPHEMES = 1000;

/** 管理者向けの一覧ページング既定・最大(監査ログ・ユーザー一覧等)。 */
export const ADMIN_LIST_DEFAULT_LIMIT = 20;
export const ADMIN_LIST_MAX_LIMIT = 100;

/** 管理者セッション(BR-COMMON-002): 有効 8 時間・アイドルタイムアウト 30 分。 */
export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;
export const ADMIN_SESSION_IDLE_TIMEOUT_SECONDS = 30 * 60;

/** WebAuthn チャレンジの寿命(数分・ワンタイム、db §7)。 */
export const WEBAUTHN_CHALLENGE_TTL_SECONDS = 5 * 60;
