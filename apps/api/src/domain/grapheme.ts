// 書記素クラスタ単位の文字数計数(BR-COMMON-008)。
// 絵文字・結合文字・国旗などを「見た目の 1 文字」として数える(コードポイント数ではない)。
// Intl.Segmenter(Node 18+ で利用可)を用い、未対応環境では Array.from(コードポイント単位)へ退避する。

const segmenter =
  typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('und', { granularity: 'grapheme' })
    : null;

export function countGraphemes(input: string): number {
  if (input.length === 0) {
    return 0;
  }
  if (segmenter) {
    let count = 0;
    for (const _segment of segmenter.segment(input)) {
      count += 1;
    }
    return count;
  }
  // 退避: コードポイント単位(結合文字は分離して数えるが、近似として許容)。
  return Array.from(input).length;
}

export function withinGraphemeLimit(input: string, max: number): boolean {
  return countGraphemes(input) <= max;
}
