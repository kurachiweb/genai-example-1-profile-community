// 表示名の組み立て(BR-PROF-003/004)と検索名の導出(BR-DISC-004)。
// 表示名は firstName/lastName と nameDisplayOrder から決定論的に組み立て、二重空白・前後空白を生じさせない。

export const NameDisplayOrder = {
	GIVEN_FIRST: 'givenNameFirst',
	FAMILY_FIRST: 'familyNameFirst'
} as const;

export type NameDisplayOrder = (typeof NameDisplayOrder)[keyof typeof NameDisplayOrder];

function orderedParts(firstName: string, lastName: string, order: NameDisplayOrder): string[] {
	return order === NameDisplayOrder.FAMILY_FIRST ? [lastName, firstName] : [firstName, lastName];
}

/**
 * 表示名を組み立てる。空のパートは詰め、半角空白 1 つで連結する(BR-PROF-003)。
 * 例: order=familyNameFirst, first='みなと', last='里中' → '里中 みなと'
 */
export function buildDisplayName(
	firstName: string,
	lastName: string,
	order: NameDisplayOrder
): string {
	return orderedParts(firstName, lastName, order)
		.map((part) => part.trim())
		.filter((part) => part.length > 0)
		.join(' ');
}

/**
 * 検索用の導出名(BR-DISC-004)。表示順に連結し NFC 正規化・ケースフォールド(小文字化)する。
 * 比較は本値に対して行い、profiles.search_name として保存する(db §5.2)。
 */
export function buildSearchName(
	firstName: string,
	lastName: string,
	order: NameDisplayOrder
): string {
	return buildDisplayName(firstName, lastName, order).normalize('NFC').toLowerCase();
}
