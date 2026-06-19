// 書記素クラスタ単位の文字数計算（BR-COMMON-008）。
// 名前・自己紹介などは絵文字・結合文字を 1 文字として数えるため、コードポイント数ではなく
// 見た目（書記素クラスタ）で上限を管理する。Intl.Segmenter を用い、未対応環境では
// スプレッド（コードポイント分割）にフォールバックする。
const segmenter =
	typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
		? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
		: null;

export function countGraphemes(value: string): number {
	if (value.length === 0) {
		return 0;
	}
	if (!segmenter) {
		return [...value].length;
	}
	// Segmenter のイテレータを展開して書記素数を得る（ループ変数を持たず簡潔に保つ）。
	return [...segmenter.segment(value)].length;
}

/** 書記素数が上限以下かを判定する（max は features/ の業務値を渡す）。 */
export function withinGraphemeLimit(value: string, max: number): boolean {
	return countGraphemes(value) <= max;
}
