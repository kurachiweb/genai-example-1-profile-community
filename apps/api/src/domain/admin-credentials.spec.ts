import {
	ADMIN_PASSWORD_MIN_LENGTH,
	assertValidAdminPassword,
	assertValidEmail,
	isValidEmail,
	normalizeEmail
} from './admin-credentials';
import { ValidationError } from './errors';

describe('normalizeEmail', () => {
	test('トリムして小文字化する', () => {
		expect(normalizeEmail('  Admin@Example.COM ')).toBe('admin@example.com');
	});
});

describe('isValidEmail / assertValidEmail', () => {
	test('妥当な形式は true', () => {
		expect(isValidEmail('admin@example.com')).toBe(true);
	});
	test('不正な形式は false で assert は ValidationError', () => {
		expect(isValidEmail('not-an-email')).toBe(false);
		expect(() => assertValidEmail('not-an-email')).toThrow(ValidationError);
	});
});

describe('assertValidAdminPassword', () => {
	test('最小長以上なら通す', () => {
		expect(() => assertValidAdminPassword('a'.repeat(ADMIN_PASSWORD_MIN_LENGTH))).not.toThrow();
	});
	test('短すぎると ValidationError', () => {
		expect(() => assertValidAdminPassword('short')).toThrow(ValidationError);
	});
});
