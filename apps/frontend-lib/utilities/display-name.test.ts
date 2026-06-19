import { buildDisplayName, profileIconAlt } from '@/utilities/display-name';

describe('buildDisplayName', () => {
	test('givenNameFirst は 名→姓 の順で連結する', () => {
		const result = buildDisplayName({
			firstName: 'Maria',
			lastName: 'Garcia-Lopez',
			order: 'givenNameFirst'
		});

		expect(result).toBe('Maria Garcia-Lopez');
	});

	test('familyNameFirst は 姓→名 の順で連結する', () => {
		const result = buildDisplayName({
			firstName: 'みなと',
			lastName: '里中',
			order: 'familyNameFirst'
		});

		expect(result).toBe('里中 みなと');
	});

	test('前後の空白をトリムし二重空白を生じさせない', () => {
		const result = buildDisplayName({
			firstName: '  みなと  ',
			lastName: '  里中 ',
			order: 'familyNameFirst'
		});

		expect(result).toBe('里中 みなと');
	});

	test('片方が空でも余分な空白を残さない', () => {
		expect(buildDisplayName({ firstName: 'Maria', lastName: '', order: 'givenNameFirst' })).toBe(
			'Maria'
		);
		expect(buildDisplayName({ firstName: '', lastName: '里中', order: 'familyNameFirst' })).toBe(
			'里中'
		);
	});

	test('両方が空なら空文字を返す', () => {
		expect(buildDisplayName({ firstName: '', lastName: '', order: 'givenNameFirst' })).toBe('');
	});
});

describe('profileIconAlt', () => {
	test('表示名があれば「{表示名} のプロフィールアイコン」', () => {
		expect(profileIconAlt('里中 みなと')).toBe('里中 みなと のプロフィールアイコン');
	});

	test('表示名が空なら汎用文言にフォールバックする', () => {
		expect(profileIconAlt('')).toBe('プロフィールアイコン');
		expect(profileIconAlt('   ')).toBe('プロフィールアイコン');
	});
});
