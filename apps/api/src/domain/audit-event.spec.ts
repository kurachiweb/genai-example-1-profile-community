import {
	AuditActorType,
	AuditEventType,
	AuditResult,
	buildAuditLog,
	sanitizeAuditMetadata
} from './audit-event';

describe('sanitizeAuditMetadata', () => {
	test('秘匿キー(password/token/cookie/keyHash 等)を除去する(BR-COMMON-014)', () => {
		const result = sanitizeAuditMetadata({
			reason: 'spam',
			password: 'x',
			passwordHash: 'y',
			sessionId: 'z',
			apiKey: 'k',
			keyHash: 'h',
			challenge: 'c',
			Authorization: 'Bearer ...'
		});

		expect(result).toEqual({ reason: 'spam' });
	});

	test('秘匿キーしか無ければ null', () => {
		expect(sanitizeAuditMetadata({ token: 'a', secret: 'b' })).toBeNull();
	});

	test('null/undefined は null', () => {
		expect(sanitizeAuditMetadata(null)).toBeNull();
		expect(sanitizeAuditMetadata(undefined)).toBeNull();
	});

	test('旧新差分など通常のメタは保持する', () => {
		const meta = { from: 'viewer', to: 'moderator' };
		expect(sanitizeAuditMetadata(meta)).toEqual(meta);
	});
});

describe('buildAuditLog', () => {
	const occurredAt = new Date('2026-06-19T00:00:00Z');

	test('既定の result は success、欠落フィールドは null', () => {
		const record = buildAuditLog({
			id: 'log-1',
			eventType: AuditEventType.USER_FROZEN,
			actorType: AuditActorType.ADMIN,
			actorId: 'admin-1',
			targetType: 'user',
			targetId: 'user-9',
			occurredAt
		});

		expect(record).toEqual({
			id: 'log-1',
			eventType: 'user.frozen',
			actorType: 'admin',
			actorId: 'admin-1',
			targetType: 'user',
			targetId: 'user-9',
			result: 'success',
			metadata: null,
			occurredAt
		});
	});

	test('メタデータは秘匿値を除いて格納する', () => {
		const record = buildAuditLog({
			id: 'log-2',
			eventType: AuditEventType.ADMIN_LOGIN_FAILED,
			actorType: AuditActorType.ADMIN,
			result: AuditResult.FAILURE,
			metadata: { email: 'a@example.com', password: 'should-not-store' },
			occurredAt
		});

		expect(record.result).toBe('failure');
		expect(record.metadata).toEqual({ email: 'a@example.com' });
	});
});
