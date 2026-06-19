import {
	API_RATE_LIMIT_MAX_PER_MINUTE,
	API_RATE_LIMIT_MIN_PER_MINUTE,
	assertValidRateLimit,
	DEFAULT_API_RATE_LIMIT_PER_MINUTE,
	isValidRateLimit
} from './rate-limit';
import { ValidationError } from './errors';

describe('rate-limit しきい値', () => {
	test('既定は 60(BR-API-008)', () => {
		expect(DEFAULT_API_RATE_LIMIT_PER_MINUTE).toBe(60);
	});

	test('範囲内の整数は有効(60 → 120 への変更例 AC-ADMIN-009)', () => {
		expect(isValidRateLimit(120)).toBe(true);
		expect(isValidRateLimit(API_RATE_LIMIT_MIN_PER_MINUTE)).toBe(true);
		expect(isValidRateLimit(API_RATE_LIMIT_MAX_PER_MINUTE)).toBe(true);
	});

	test('0 以下・非整数・過大は無効', () => {
		expect(isValidRateLimit(0)).toBe(false);
		expect(isValidRateLimit(-5)).toBe(false);
		expect(isValidRateLimit(1.5)).toBe(false);
		expect(isValidRateLimit(API_RATE_LIMIT_MAX_PER_MINUTE + 1)).toBe(false);
	});

	test('assertValidRateLimit は不正時 ValidationError', () => {
		expect(() => assertValidRateLimit(0)).toThrow(ValidationError);
		expect(() => assertValidRateLimit(120)).not.toThrow();
	});
});
