import { NameDisplayOrder } from './display-name';
import { ValidationError } from './errors';
import { validateProfileContent } from './profile-fields';

describe('validateProfileContent(BR-PROF-002/005/006)', () => {
	test('提供されたフィールドのみを結果に含める(部分更新)', () => {
		const result = validateProfileContent({ occupation: 'エンジニア' });
		expect(result).toEqual({ occupation: 'エンジニア' });
	});

	test('氏名 50 文字は許可、51 文字は ValidationError(境界値)', () => {
		expect(validateProfileContent({ firstName: 'あ'.repeat(50) }).firstName).toBe('あ'.repeat(50));
		expect(() => validateProfileContent({ firstName: 'あ'.repeat(51) })).toThrow(ValidationError);
	});

	test('氏名の空(空白のみ)は必須エラー(AC-PROF-008)', () => {
		expect(() => validateProfileContent({ lastName: '   ' })).toThrow(ValidationError);
	});

	test('職業 51 文字は ValidationError(BR-PROF-005)', () => {
		expect(() => validateProfileContent({ occupation: 'あ'.repeat(51) })).toThrow(ValidationError);
	});

	test('空文字の任意項目は null に正規化する(AC-PROF-005 相当のクリア)', () => {
		expect(validateProfileContent({ occupation: '' }).occupation).toBeNull();
		expect(validateProfileContent({ bio: '   ' }).bio).toBeNull();
	});

	test('自己紹介は改行を保持する(BR-PROF-006)', () => {
		expect(validateProfileContent({ bio: '1 行目\n2 行目' }).bio).toBe('1 行目\n2 行目');
	});

	test('表示順の不正値は ValidationError', () => {
		expect(() => validateProfileContent({ nameDisplayOrder: 'middleFirst' })).toThrow(
			ValidationError
		);
	});

	test('表示順の正当値は受理する', () => {
		expect(validateProfileContent({ nameDisplayOrder: NameDisplayOrder.FAMILY_FIRST })).toEqual({
			nameDisplayOrder: NameDisplayOrder.FAMILY_FIRST
		});
	});
});
