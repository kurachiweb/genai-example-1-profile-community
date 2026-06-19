// 表示名の決定論的な組み立て（BR-PROF-003 / BR-PROF-004・design/04 §1）。
// firstName/lastName と表示順から組み立て、二重空白・前後余白を生じさせない。
// 公開ページ・一覧・検索・OGP すべてで一貫させるため、共通ライブラリに集約する。

export type NameDisplayOrder = 'givenNameFirst' | 'familyNameFirst';

export interface DisplayNameInput {
	readonly firstName: string;
	readonly lastName: string;
	readonly order: NameDisplayOrder;
}

export function buildDisplayName({ firstName, lastName, order }: DisplayNameInput): string {
	const given = firstName.trim();
	const family = lastName.trim();
	// familyNameFirst は姓→名、givenNameFirst（既定）は名→姓。
	const ordered = order === 'familyNameFirst' ? [family, given] : [given, family];
	// 片方が未設定でも二重空白を生まないよう、空要素を除いてから 1 つの半角空白で連結する。
	return ordered.filter((part) => part.length > 0).join(' ');
}

/**
 * プロフィールアイコンの代替テキストを表示名から生成する（design/04 §3）。
 * 氏名未設定のときは個人を特定しない汎用文言にフォールバックする。
 */
export function profileIconAlt(displayName: string): string {
	const trimmed = displayName.trim();
	return trimmed.length > 0 ? `${trimmed} のプロフィールアイコン` : 'プロフィールアイコン';
}
