import {
	AdminPermission,
	AdminRole,
	assertCan,
	can,
	isAdminRole,
	permissionsFor
} from './admin-role';
import { ForbiddenError } from './errors';

describe('admin-role RBAC', () => {
	describe('super_admin', () => {
		test('全権限を持つ', () => {
			for (const permission of Object.values(AdminPermission)) {
				expect(can(AdminRole.SUPER_ADMIN, permission)).toBe(true);
			}
		});
	});

	describe('viewer', () => {
		test('閲覧はできる', () => {
			expect(can(AdminRole.VIEWER, AdminPermission.VIEW_STATS)).toBe(true);
			expect(can(AdminRole.VIEWER, AdminPermission.VIEW_AUDIT_LOG)).toBe(true);
		});

		test('変更操作はできない(AC-ADMIN-001)', () => {
			expect(can(AdminRole.VIEWER, AdminPermission.MODERATE_FREEZE_USER)).toBe(false);
			expect(can(AdminRole.VIEWER, AdminPermission.MANAGE_ADMINS)).toBe(false);
		});
	});

	describe('moderator', () => {
		test('凍結・解除・アイコン削除・通報審査ができる(BR-ADMIN-005/006)', () => {
			expect(can(AdminRole.MODERATOR, AdminPermission.MODERATE_FREEZE_USER)).toBe(true);
			expect(can(AdminRole.MODERATOR, AdminPermission.MODERATE_REVIEW_UNFREEZE)).toBe(true);
			expect(can(AdminRole.MODERATOR, AdminPermission.MODERATE_DELETE_ICON)).toBe(true);
		});

		test('お知らせ公開・メール配信ができる(BR-CONTENT-001/003)', () => {
			expect(can(AdminRole.MODERATOR, AdminPermission.ANNOUNCEMENT_PUBLISH)).toBe(true);
			expect(can(AdminRole.MODERATOR, AdminPermission.EMAIL_SEND)).toBe(true);
		});

		test('管理者管理・しきい値変更・規約公開・ヘルプ編集はできない', () => {
			expect(can(AdminRole.MODERATOR, AdminPermission.MANAGE_ADMINS)).toBe(false);
			expect(can(AdminRole.MODERATOR, AdminPermission.API_RATE_LIMIT_UPDATE)).toBe(false);
			expect(can(AdminRole.MODERATOR, AdminPermission.POLICY_PUBLISH)).toBe(false);
			expect(can(AdminRole.MODERATOR, AdminPermission.HELP_EDIT)).toBe(false);
		});
	});

	describe('support', () => {
		test('問い合わせ対応・ヘルプ編集・お知らせ下書きができる', () => {
			expect(can(AdminRole.SUPPORT, AdminPermission.INQUIRY_HANDLE)).toBe(true);
			expect(can(AdminRole.SUPPORT, AdminPermission.HELP_EDIT)).toBe(true);
			expect(can(AdminRole.SUPPORT, AdminPermission.ANNOUNCEMENT_DRAFT)).toBe(true);
		});

		test('ユーザー処分・お知らせ公開はできない', () => {
			expect(can(AdminRole.SUPPORT, AdminPermission.MODERATE_FREEZE_USER)).toBe(false);
			expect(can(AdminRole.SUPPORT, AdminPermission.ANNOUNCEMENT_PUBLISH)).toBe(false);
		});
	});

	describe('assertCan', () => {
		test('権限が無ければ ForbiddenError を投げる', () => {
			expect(() => assertCan(AdminRole.VIEWER, AdminPermission.MODERATE_FREEZE_USER)).toThrow(
				ForbiddenError
			);
		});

		test('権限があれば何も投げない', () => {
			expect(() =>
				assertCan(AdminRole.MODERATOR, AdminPermission.MODERATE_FREEZE_USER)
			).not.toThrow();
		});
	});

	describe('isAdminRole', () => {
		test('有効なロールのみ true', () => {
			expect(isAdminRole('super_admin')).toBe(true);
			expect(isAdminRole('moderator')).toBe(true);
			expect(isAdminRole('owner')).toBe(false);
			expect(isAdminRole(null)).toBe(false);
		});
	});

	describe('permissionsFor', () => {
		test('viewer の権限はすべて VIEW_ 系', () => {
			expect(permissionsFor(AdminRole.VIEWER).every((p) => p.startsWith('VIEW_'))).toBe(true);
		});
	});
});
