// 書記素クラスタ単位の文字数計数(BR-COMMON-008)。
// 絵文字・結合文字・国旗などを「見た目の 1 文字」として数える(コードポイント数ではない)。

const segmenter = new Intl.Segmenter('und', { granularity: 'grapheme' });

export function countGraphemes(input: string): number {
	if (input.length === 0) {
		return 0;
	}
	return [...segmenter.segment(input)].length;
}

export function withinGraphemeLimit(input: string, max: number): boolean {
	return countGraphemes(input) <= max;
}
