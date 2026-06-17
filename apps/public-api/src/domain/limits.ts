// 業務上限値の名前付き定数(マジックナンバー化の回避、coding/01-architecture.md §4)。
// 値の正本は docs/service/features/(BR-*)。変更は features/ を更新してから本定数へ反映する。

/** 氏名(BR-PROF-002): firstName/lastName ともに 1〜50 書記素・必須。 */
export const NAME_MAX_GRAPHEMES = 50;

/** 職業(BR-PROF-005): 最大 50 書記素・単一行・任意。 */
export const OCCUPATION_MAX_GRAPHEMES = 50;

/** 自己紹介(BR-PROF-006): 最大 500 書記素・改行可・任意。 */
export const BIO_MAX_GRAPHEMES = 500;

/** SNS リンク(BR-PROF-007): 最大 10 件、URL 最大 2048、ラベル最大 30 書記素。 */
export const SNS_LINKS_MAX_COUNT = 10;
export const SNS_URL_MAX_LENGTH = 2048;
export const SNS_LABEL_MAX_GRAPHEMES = 30;

/** 一覧/検索のページング(BR-DISC-003 / BR-API-007): 既定 20・最大 100。 */
export const PROFILE_LIST_DEFAULT_LIMIT = 20;
export const PROFILE_LIST_MAX_LIMIT = 100;
