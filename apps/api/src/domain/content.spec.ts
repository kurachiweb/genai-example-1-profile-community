import {
	assertInquiryTransition,
	assertValidSlug,
	assertValidTitle,
	canTransitionInquiry,
	InquiryStatus,
	isValidSlug
} from './content';
import { ValidationError } from './errors';

describe('問い合わせの状態遷移(BR-CONTENT-007)', () => {
	test('OPEN から対応中・クローズへ遷移できる', () => {
		expect(canTransitionInquiry(InquiryStatus.OPEN, InquiryStatus.IN_PROGRESS)).toBe(true);
		expect(canTransitionInquiry(InquiryStatus.OPEN, InquiryStatus.CLOSED)).toBe(true);
	});

	test('クローズ後の再開を許容する', () => {
		expect(canTransitionInquiry(InquiryStatus.CLOSED, InquiryStatus.OPEN)).toBe(true);
	});

	test('対応中→OPEN(差し戻し)は可、OPEN→OPEN は不正', () => {
		expect(canTransitionInquiry(InquiryStatus.IN_PROGRESS, InquiryStatus.OPEN)).toBe(true);
		expect(() => assertInquiryTransition(InquiryStatus.OPEN, InquiryStatus.OPEN)).toThrow(
			ValidationError
		);
	});
});

describe('スラッグ検証(BR-CONTENT-005)', () => {
	test('英小文字・数字・単一ハイフンは有効', () => {
		expect(isValidSlug('getting-started')).toBe(true);
		expect(isValidSlug('faq2')).toBe(true);
	});

	test('大文字・連続ハイフン・記号・空は無効', () => {
		expect(isValidSlug('Getting-Started')).toBe(false);
		expect(isValidSlug('a--b')).toBe(false);
		expect(isValidSlug('hello world')).toBe(false);
		expect(isValidSlug('')).toBe(false);
		expect(() => assertValidSlug('Bad Slug')).toThrow(ValidationError);
	});
});

describe('タイトル検証(BR-CONTENT-001)', () => {
	test('空・上限超過は ValidationError', () => {
		expect(() => assertValidTitle('   ')).toThrow(ValidationError);
		expect(() => assertValidTitle('あ'.repeat(121))).toThrow(ValidationError);
	});

	test('妥当なタイトルは通す', () => {
		expect(() => assertValidTitle('メンテナンスのお知らせ')).not.toThrow();
	});
});
