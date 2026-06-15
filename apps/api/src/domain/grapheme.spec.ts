import { countGraphemes, withinGraphemeLimit } from './grapheme';

describe('countGraphemes(BR-COMMON-008 書記素単位の計数)', () => {
	test('空文字は 0', () => {
		expect(countGraphemes('')).toBe(0);
	});

	test('ASCII は見た目どおりの文字数', () => {
		expect(countGraphemes('hello')).toBe(5);
	});

	test('絵文字(ZWJ シーケンス)を 1 文字として数える', () => {
		// 👨‍👩‍👧(family)は複数コードポイントだが見た目は 1 書記素。
		const family = '👨‍👩‍👧';
		expect(family.length).toBeGreaterThan(1); // UTF-16 単位では複数
		expect(countGraphemes(family)).toBe(1);
	});

	test('結合文字付きの 1 文字を 1 と数える', () => {
		const aRing = String.fromCodePoint(0x61, 0x030a); // 'a' + 合成リング(2 コードポイント)
		expect(countGraphemes(aRing)).toBe(1);
	});
});

describe('withinGraphemeLimit(境界値)', () => {
	test('上限ちょうどは許可、超過は不許可(BR-PROF-006 の 500 を想定)', () => {
		const exactly = 'あ'.repeat(500);
		const over = 'あ'.repeat(501);
		expect(withinGraphemeLimit(exactly, 500)).toBe(true);
		expect(withinGraphemeLimit(over, 500)).toBe(false);
	});
});
