import {
	auditEventLabel,
	reportReasonLabel,
	roleLabel,
	userStatusLabel,
	userStatusTone
} from './labels';

describe('labels', () => {
	test('ロールを日本語化する', () => {
		expect(roleLabel('super_admin')).toBe('スーパー管理者');
		expect(roleLabel('moderator')).toBe('モデレーター');
	});

	test('ユーザー状態を日本語化する', () => {
		expect(userStatusLabel('FROZEN')).toBe('凍結');
		expect(userStatusLabel('ACTIVE')).toBe('有効');
	});

	test('状態 → トーンは色だけに依存しない設計の対応づけ', () => {
		expect(userStatusTone('FROZEN')).toBe('danger');
		expect(userStatusTone('ACTIVE')).toBe('success');
		expect(userStatusTone('UNVERIFIED')).toBe('warning');
	});

	test('通報理由・監査イベントを日本語化し、未知値はそのまま返す', () => {
		expect(reportReasonLabel('spam')).toBe('スパム');
		expect(auditEventLabel('user.frozen')).toBe('ユーザー凍結');
		expect(auditEventLabel('unknown.event')).toBe('unknown.event');
	});
});
