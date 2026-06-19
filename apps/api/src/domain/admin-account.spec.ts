import {
	AdminAccountStatus,
	assertDisableAllowed,
	assertRoleChangeAllowed,
	isAdminAccountStatus
} from './admin-account';
import { AdminRole } from './admin-role';
import { ValidationError } from './errors';

describe('assertRoleChangeAllowed', () => {
	test('スーパー管理者が moderator を追加・昇格できる(AC-ADMIN-002)', () => {
		expect(() =>
			assertRoleChangeAllowed({
				actorId: 'admin-1',
				targetId: 'admin-2',
				targetCurrentRole: AdminRole.VIEWER,
				newRole: AdminRole.MODERATOR,
				activeSuperAdminCount: 2
			})
		).not.toThrow();
	});

	test('唯一のスーパー管理者の降格は拒否される(AC-ADMIN-003)', () => {
		expect(() =>
			assertRoleChangeAllowed({
				actorId: 'admin-1',
				targetId: 'admin-2',
				targetCurrentRole: AdminRole.SUPER_ADMIN,
				newRole: AdminRole.MODERATOR,
				activeSuperAdminCount: 1
			})
		).toThrow(ValidationError);
	});

	test('自分自身のスーパー管理者権限の剥奪は拒否される', () => {
		expect(() =>
			assertRoleChangeAllowed({
				actorId: 'admin-1',
				targetId: 'admin-1',
				targetCurrentRole: AdminRole.SUPER_ADMIN,
				newRole: AdminRole.VIEWER,
				activeSuperAdminCount: 3
			})
		).toThrow(ValidationError);
	});

	test('スーパー管理者が複数いれば他者の降格は可能', () => {
		expect(() =>
			assertRoleChangeAllowed({
				actorId: 'admin-1',
				targetId: 'admin-2',
				targetCurrentRole: AdminRole.SUPER_ADMIN,
				newRole: AdminRole.MODERATOR,
				activeSuperAdminCount: 2
			})
		).not.toThrow();
	});

	test('同一ロールへの変更は no-op', () => {
		expect(() =>
			assertRoleChangeAllowed({
				actorId: 'admin-1',
				targetId: 'admin-2',
				targetCurrentRole: AdminRole.MODERATOR,
				newRole: AdminRole.MODERATOR,
				activeSuperAdminCount: 1
			})
		).not.toThrow();
	});
});

describe('assertDisableAllowed', () => {
	test('自分自身の無効化は拒否される', () => {
		expect(() =>
			assertDisableAllowed({
				actorId: 'admin-1',
				targetId: 'admin-1',
				targetRole: AdminRole.MODERATOR,
				activeSuperAdminCount: 2
			})
		).toThrow(ValidationError);
	});

	test('最後のスーパー管理者の無効化は拒否される', () => {
		expect(() =>
			assertDisableAllowed({
				actorId: 'admin-1',
				targetId: 'admin-2',
				targetRole: AdminRole.SUPER_ADMIN,
				activeSuperAdminCount: 1
			})
		).toThrow(ValidationError);
	});

	test('他の moderator の無効化は可能', () => {
		expect(() =>
			assertDisableAllowed({
				actorId: 'admin-1',
				targetId: 'admin-2',
				targetRole: AdminRole.MODERATOR,
				activeSuperAdminCount: 1
			})
		).not.toThrow();
	});
});

describe('isAdminAccountStatus', () => {
	test('active/disabled のみ true', () => {
		expect(isAdminAccountStatus(AdminAccountStatus.ACTIVE)).toBe(true);
		expect(isAdminAccountStatus('deleted')).toBe(false);
	});
});
