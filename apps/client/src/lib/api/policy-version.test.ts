import { parsePolicyVersionParam } from './policy-version';

describe('parsePolicyVersionParam', () => {
	test('数字のみの文字列を数値へ変換する', () => {
		expect(parsePolicyVersionParam('1')).toBe(1);
		expect(parsePolicyVersionParam('42')).toBe(42);
	});

	test('数字以外を含む場合は null を返す(notFound へ導く)', () => {
		expect(parsePolicyVersionParam('abc')).toBeNull();
		expect(parsePolicyVersionParam('1.5')).toBeNull();
		expect(parsePolicyVersionParam('-1')).toBeNull();
		expect(parsePolicyVersionParam('')).toBeNull();
	});
});
