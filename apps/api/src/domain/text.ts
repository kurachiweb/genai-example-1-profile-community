// 文字列の正規化(BR-COMMON-008/009)。アプリ層で実施し、DB には正規化済みの値を保存する。
//   - 前後の空白をトリム
//   - NFC 正規化(Unicode 合成済み形式)
//   - 不可視・両方向制御文字の除去(なりすまし・表示崩れ・ホモグラフ攻撃の防止)
//   - 制御文字の除去(改行は allowNewlines のときのみ保持)

export interface NormalizeOptions {
  /** 改行(\n)を許可する欄(自己紹介など)では true。氏名・職業などの単一行は false。 */
  readonly allowNewlines?: boolean;
}

// ゼロ幅・BOM・語結合子・両方向制御など、視覚上見えない/紛らわしい文字の範囲。
// 不可視文字をソースへ直接埋め込まないよう、コードポイント範囲から RegExp を構築する。
//   U+200B-200F(ゼロ幅/方向マーク), U+202A-202E(両方向埋め込み), U+2060-2064,
//   U+2066-206F(両方向分離・非推奨整形), U+FEFF(BOM)。
const INVISIBLE_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x200b, 0x200f],
  [0x202a, 0x202e],
  [0x2060, 0x2064],
  [0x2066, 0x206f],
  [0xfeff, 0xfeff],
];

const INVISIBLE_CHARS = new RegExp(
  '[' +
    INVISIBLE_RANGES.map(([start, end]) =>
      start === end
        ? `\\u${start.toString(16).padStart(4, '0')}`
        : `\\u${start.toString(16).padStart(4, '0')}-\\u${end.toString(16).padStart(4, '0')}`,
    ).join('') +
    ']',
  'g',
);

export function stripInvisible(input: string): string {
  return input.replace(INVISIBLE_CHARS, '');
}

function stripControlChars(input: string, allowNewlines: boolean): string {
  // C0(除く \t \n)・DEL・C1 を除去する。\t は半角空白へ畳む。\r は除去(CRLF/CR→LF 正規化の一環)。
  let out = '';
  for (const ch of input) {
    const code = ch.codePointAt(0)!;
    if (ch === '\n') {
      out += allowNewlines ? '\n' : ' ';
      continue;
    }
    if (ch === '\t') {
      out += ' ';
      continue;
    }
    if (ch === '\r') {
      continue;
    }
    const isC0 = code <= 0x1f;
    const isDelOrC1 = code >= 0x7f && code <= 0x9f;
    if (isC0 || isDelOrC1) {
      continue;
    }
    out += ch;
  }
  return out;
}

/**
 * 自由入力文字列を保存前の正規形へ整える。
 * 注意: 文字数の上限判定は書記素単位(grapheme.ts)で別途行う。本関数は長さを切り詰めない。
 */
export function normalizeText(input: string, options: NormalizeOptions = {}): string {
  const allowNewlines = options.allowNewlines ?? false;
  const withoutInvisible = stripInvisible(input);
  const withoutControl = stripControlChars(withoutInvisible, allowNewlines);
  const normalized = withoutControl.normalize('NFC');
  return normalized.trim();
}
