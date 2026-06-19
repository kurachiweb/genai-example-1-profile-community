import { countGraphemes, withinGraphemeLimit } from '@/utilities/grapheme';

describe('countGraphemes', () => {
	test('空文字は 0', () => {
		expect(countGraphemes('')).toBe(0);
	});

	test('ASCII はコードポイントどおり数える', () => {
		expect(countGraphemes('Maria')).toBe(5);
	});

	test('和文を 1 文字ずつ数える', () => {
		expect(countGraphemes('里中みなと')).toBe(5);
	});

	test('絵文字（合成・肌色修飾子）を 1 書記素として数える', () => {
		// 家族絵文字や肌色修飾付き絵文字は複数コードポイントだが見た目は 1 文字。
		expect(countGraphemes('👨‍👩‍👧')).toBe(1);
		expect(countGraphemes('👍🏽')).toBe(1);
	});

	test('結合文字（濁点合成）を 1 書記素として数える', () => {
		// "が" を "か" + 結合濁点で表した場合でも 1 文字とみなす。
		expect(countGraphemes('が')).toBe(1);
	});
});

describe('withinGraphemeLimit', () => {
	test('上限以下は true', () => {
		expect(withinGraphemeLimit('みなと', 50)).toBe(true);
	});

	test('上限超過は false', () => {
		expect(withinGraphemeLimit('あ'.repeat(51), 50)).toBe(false);
	});

	test('境界値（ちょうど上限）は true', () => {
		expect(withinGraphemeLimit('あ'.repeat(50), 50)).toBe(true);
	});
});
