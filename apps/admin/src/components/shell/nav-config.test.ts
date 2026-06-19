import { NAV_ITEMS, visibleNavItems } from './nav-config';

describe('visibleNavItems', () => {
	test('super_admin は全項目を見られる', () => {
		expect(visibleNavItems('super_admin')).toHaveLength(NAV_ITEMS.length);
	});

	test('moderator には「管理者・権限」が表示されない(AC-ADMIN-001)', () => {
		const labels = visibleNavItems('moderator').map((item) => item.label);
		expect(labels).not.toContain('管理者・権限');
		expect(labels).toContain('ユーザー管理');
	});

	test('viewer も「管理者・権限」は非表示', () => {
		const hrefs = visibleNavItems('viewer').map((item) => item.href);
		expect(hrefs).not.toContain('/admins');
		expect(hrefs).toContain('/audit-logs');
	});
});
