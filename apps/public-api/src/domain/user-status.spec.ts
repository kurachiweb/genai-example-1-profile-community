import { ValidationError } from './errors';
import { UserStatus, assertTransition, canEditProfile, canTransition } from './user-status';

describe('user-status(COMMON-2 の状態遷移)', () => {
	describe('canTransition(許可遷移)', () => {
		test('UNVERIFIED から ACTIVE/WITHDRAWN へ遷移できる', () => {
			expect(canTransition(UserStatus.UNVERIFIED, UserStatus.ACTIVE)).toBe(true);
			expect(canTransition(UserStatus.UNVERIFIED, UserStatus.WITHDRAWN)).toBe(true);
		});

		test('ACTIVE から FROZEN/WITHDRAWN へ遷移できる', () => {
			expect(canTransition(UserStatus.ACTIVE, UserStatus.FROZEN)).toBe(true);
			expect(canTransition(UserStatus.ACTIVE, UserStatus.WITHDRAWN)).toBe(true);
		});

		test('FROZEN から ACTIVE(解除承認)へ遷移できる', () => {
			expect(canTransition(UserStatus.FROZEN, UserStatus.ACTIVE)).toBe(true);
		});
	});

	describe('canTransition(禁止遷移)', () => {
		test('UNVERIFIED から FROZEN へは遷移できない', () => {
			expect(canTransition(UserStatus.UNVERIFIED, UserStatus.FROZEN)).toBe(false);
		});

		test('WITHDRAWN は終端でありいかなる遷移もできない', () => {
			expect(canTransition(UserStatus.WITHDRAWN, UserStatus.ACTIVE)).toBe(false);
			expect(canTransition(UserStatus.WITHDRAWN, UserStatus.UNVERIFIED)).toBe(false);
		});
	});

	describe('assertTransition', () => {
		test('禁止遷移では ValidationError を投げる', () => {
			expect(() => assertTransition(UserStatus.WITHDRAWN, UserStatus.ACTIVE)).toThrow(
				ValidationError
			);
		});

		test('許可遷移では何も投げない', () => {
			expect(() => assertTransition(UserStatus.ACTIVE, UserStatus.FROZEN)).not.toThrow();
		});
	});

	describe('canEditProfile(BR-COMMON-005)', () => {
		test('UNVERIFIED/ACTIVE は編集可', () => {
			expect(canEditProfile(UserStatus.UNVERIFIED)).toBe(true);
			expect(canEditProfile(UserStatus.ACTIVE)).toBe(true);
		});

		test('FROZEN/WITHDRAWN は編集不可', () => {
			expect(canEditProfile(UserStatus.FROZEN)).toBe(false);
			expect(canEditProfile(UserStatus.WITHDRAWN)).toBe(false);
		});
	});
});
