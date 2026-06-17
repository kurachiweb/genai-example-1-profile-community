import {
	ApiKeyScope,
	ApiKeyStatus,
	assertWriteScope,
	canWriteWithScope,
	isActiveApiKey,
	isApiKeyScope
} from './api-key';
import { ForbiddenError } from './errors';

describe('isApiKeyScope', () => {
	test('既知のスコープを判定する(BR-API-001b)', () => {
		expect(isApiKeyScope('read')).toBe(true);
		expect(isApiKeyScope('full')).toBe(true);
		expect(isApiKeyScope('admin')).toBe(false);
		expect(isApiKeyScope('')).toBe(false);
	});
});

describe('isActiveApiKey', () => {
	test('active のみ認証に使える(BR-API-003)', () => {
		expect(isActiveApiKey(ApiKeyStatus.ACTIVE)).toBe(true);
		expect(isActiveApiKey(ApiKeyStatus.REVOKED)).toBe(false);
	});
});

describe('canWriteWithScope(BR-API-001b)', () => {
	test('full は書き込み可', () => {
		expect(canWriteWithScope(ApiKeyScope.FULL)).toBe(true);
	});

	test('read は書き込み不可(読み取り専用)', () => {
		expect(canWriteWithScope(ApiKeyScope.READ)).toBe(false);
	});
});

describe('assertWriteScope(AC-API-011b)', () => {
	test('full は通過する', () => {
		expect(() => assertWriteScope(ApiKeyScope.FULL)).not.toThrow();
	});

	test('read は ForbiddenError(スコープ外操作・403)', () => {
		expect(() => assertWriteScope(ApiKeyScope.READ)).toThrow(ForbiddenError);
	});
});
