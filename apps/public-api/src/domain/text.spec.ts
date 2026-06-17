import { normalizeText, stripInvisible } from './text';

// 不可視文字をソースに埋め込まないよう、テストでもコードポイントから構築する。
const ZERO_WIDTH_SPACE = String.fromCodePoint(0x200b);
const BOM = String.fromCodePoint(0xfeff);
const RTL_OVERRIDE = String.fromCodePoint(0x202e); // 両方向上書き(ホモグラフ攻撃)
const WORD_JOINER = String.fromCodePoint(0x2060);

describe('normalizeText(BR-COMMON-008/009 正規化)', () => {
	test('前後の空白をトリムする', () => {
		expect(normalizeText('  みなと  ')).toBe('みなと');
	});

	test('NFC 正規化で結合文字を合成する', () => {
		const decomposed = String.fromCodePoint(0x41, 0x030a); // 'A' + 合成リング
		expect(normalizeText(decomposed)).toBe('Å'); // 'Å'
		expect(normalizeText(decomposed).length).toBe(1);
	});

	test('ゼロ幅・BOM・両方向制御・語結合子などの不可視文字を除去する', () => {
		const input = `山${ZERO_WIDTH_SPACE}田${BOM}${RTL_OVERRIDE}太${WORD_JOINER}郎`;
		expect(normalizeText(input)).toBe('山田太郎');
	});

	test('単一行(既定)では改行を空白へ、タブを空白へ畳み、復帰を除去する', () => {
		expect(normalizeText('a\nb\tc\r')).toBe('a b c');
	});

	test('allowNewlines のとき改行は保持し、復帰(CRLF)は除去する', () => {
		expect(normalizeText('1 行目\r\n2 行目', { allowNewlines: true })).toBe('1 行目\n2 行目');
	});

	test('C0 制御文字(NUL 等)を除去する', () => {
		expect(normalizeText(`a${String.fromCodePoint(0x00)}b`)).toBe('ab');
	});
});

describe('stripInvisible', () => {
	test('可視文字は保持する', () => {
		expect(stripInvisible('Maria Garcia-Lopez')).toBe('Maria Garcia-Lopez');
	});
});
