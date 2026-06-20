import { AdminRole } from '../../domain/admin-role';
import {
	AnnouncementStatus,
	EmailTargetCondition,
	InquiryCategory,
	InquiryStatus,
	PolicyType
} from '../../domain/content';
import { ForbiddenError, NotFoundError, ValidationError } from '../../domain/errors';
import { AnnouncementService } from './announcement.service';
import { AuditRecorder } from './audit-recorder';
import { EmailNotificationService } from './email-notification.service';
import { HelpArticleService } from './help-article.service';
import { InquiryService } from './inquiry.service';
import { PolicyService } from './policy.service';
import { FakeClock, FakeIdGenerator, InMemoryAuditLogRepository } from './fakes';
import {
	FakeEmailRecipientRepository,
	InMemoryAnnouncementRepository,
	InMemoryEmailNotificationRepository,
	InMemoryHelpArticleRepository,
	InMemoryInquiryRepository,
	InMemoryPolicyRepository,
	RecordingMailSender
} from './content-fakes';
import { AdminPrincipal } from './models';
import { InquiryRecord as ContentInquiryRecord, PolicyRecord } from './content-models';

const SUPER: AdminPrincipal = { adminId: 'a-super', role: AdminRole.SUPER_ADMIN };
const MOD: AdminPrincipal = { adminId: 'a-mod', role: AdminRole.MODERATOR };
const SUPPORT: AdminPrincipal = { adminId: 'a-sup', role: AdminRole.SUPPORT };

function audit() {
	const repo = new InMemoryAuditLogRepository();
	const recorder = new AuditRecorder({
		audit: repo,
		clock: new FakeClock(),
		ids: new FakeIdGenerator('log')
	});
	return { repo, recorder };
}

describe('AnnouncementService', () => {
	function setup() {
		const announcements = new InMemoryAnnouncementRepository();
		const { repo, recorder } = audit();
		const service = new AnnouncementService({
			announcements,
			audit: recorder,
			clock: new FakeClock(),
			ids: new FakeIdGenerator('an')
		});
		return { service, announcements, auditRepo: repo };
	}

	test('support は下書きを作成でき、moderator は公開でき監査に残る(AC-CONTENT-001)', async () => {
		const { service, auditRepo } = setup();
		const draft = await service.create(SUPPORT, { title: 'メンテナンス', bodyMarkdown: '# 本文' });
		expect(draft.status).toBe(AnnouncementStatus.DRAFT);

		const published = await service.publish(MOD, draft.id);
		expect(published.status).toBe(AnnouncementStatus.PUBLISHED);
		expect(published.publishStartAt).not.toBeNull();
		expect(auditRepo.records.some((r) => r.eventType === 'announcement.published')).toBe(true);
	});

	test('support は公開できない(BR-CONTENT-001)', async () => {
		const { service } = setup();
		const draft = await service.create(SUPPORT, { title: 'x', bodyMarkdown: '' });
		await expect(service.publish(SUPPORT, draft.id)).rejects.toThrow(ForbiddenError);
	});

	test('公開中のお知らせは削除できない', async () => {
		const { service } = setup();
		const draft = await service.create(SUPPORT, { title: 'x', bodyMarkdown: '' });
		await service.publish(MOD, draft.id);
		await expect(service.remove(SUPPORT, draft.id)).rejects.toThrow(ValidationError);
	});
});

describe('HelpArticleService', () => {
	function setup() {
		const articles = new InMemoryHelpArticleRepository();
		const { recorder } = audit();
		const service = new HelpArticleService({
			articles,
			audit: recorder,
			clock: new FakeClock(),
			ids: new FakeIdGenerator('hp')
		});
		return { service, articles };
	}

	test('support が記事を作成できる(BR-CONTENT-005)', async () => {
		const { service } = setup();
		const article = await service.upsert(SUPPORT, {
			title: 'はじめに',
			slug: 'getting-started',
			bodyMarkdown: '# はじめに'
		});
		expect(article.slug).toBe('getting-started');
	});

	test('重複スラッグは ValidationError', async () => {
		const { service } = setup();
		await service.upsert(SUPPORT, { title: 'A', slug: 'faq', bodyMarkdown: '' });
		await expect(
			service.upsert(SUPPORT, { title: 'B', slug: 'faq', bodyMarkdown: '' })
		).rejects.toThrow(ValidationError);
	});

	test('viewer/moderator は編集できない(HELP_EDIT)', async () => {
		const { service } = setup();
		await expect(service.upsert(MOD, { title: 'A', slug: 'x', bodyMarkdown: '' })).rejects.toThrow(
			ForbiddenError
		);
	});
});

describe('PolicyService', () => {
	function setup() {
		const policies = new InMemoryPolicyRepository();
		const { repo, recorder } = audit();
		const service = new PolicyService({
			policies,
			audit: recorder,
			clock: new FakeClock(),
			ids: new FakeIdGenerator('po')
		});
		return { service, policies, auditRepo: repo };
	}

	test('版番号は type ごとに自動採番される', async () => {
		const { service } = setup();
		const v1 = await service.createVersion(SUPER, {
			type: PolicyType.TERMS,
			bodyMarkdown: 'v1',
			requiresReconsent: false,
			effectiveDate: new Date('2026-07-01T00:00:00Z')
		});
		const v2 = await service.createVersion(SUPER, {
			type: PolicyType.TERMS,
			bodyMarkdown: 'v2',
			requiresReconsent: true,
			effectiveDate: new Date('2026-08-01T00:00:00Z')
		});
		expect(v1.version).toBe(1);
		expect(v2.version).toBe(2);
	});

	test('発効で公開中は 1 版のみになり、監査に残る(AC-CONTENT-009)', async () => {
		const { service, policies, auditRepo } = setup();
		const v1 = await service.createVersion(SUPER, {
			type: PolicyType.TERMS,
			bodyMarkdown: 'v1',
			requiresReconsent: false,
			effectiveDate: new Date('2026-07-01T00:00:00Z')
		});
		const v2 = await service.createVersion(SUPER, {
			type: PolicyType.TERMS,
			bodyMarkdown: 'v2',
			requiresReconsent: true,
			effectiveDate: new Date('2026-08-01T00:00:00Z')
		});
		await service.publish(SUPER, v1.id);
		await service.publish(SUPER, v2.id);

		const list = await policies.listByType(PolicyType.TERMS);
		expect(list.filter((p: PolicyRecord) => p.isPublished)).toHaveLength(1);
		expect(list.find((p: PolicyRecord) => p.isPublished)?.id).toBe(v2.id);
		expect(auditRepo.records.filter((r) => r.eventType === 'policy.published')).toHaveLength(2);
	});

	test('moderator は規約を編集/発効できない(POLICY_EDIT/PUBLISH は super_admin)', async () => {
		const { service } = setup();
		await expect(
			service.createVersion(MOD, {
				type: PolicyType.PRIVACY,
				bodyMarkdown: 'x',
				requiresReconsent: false,
				effectiveDate: new Date()
			})
		).rejects.toThrow(ForbiddenError);
	});
});

describe('InquiryService', () => {
	function setup(records: ContentInquiryRecord[]) {
		const inquiries = new InMemoryInquiryRepository(records);
		const { repo, recorder } = audit();
		const service = new InquiryService({ inquiries, audit: recorder, clock: new FakeClock() });
		return { service, auditRepo: repo };
	}

	const base: ContentInquiryRecord = {
		id: 'iq-1',
		category: InquiryCategory.GENERAL,
		subject: '質問です',
		body: '本文',
		contactEmail: 'user@example.com',
		status: InquiryStatus.OPEN,
		createdByUserId: null,
		createdAt: new Date('2026-06-01T00:00:00Z'),
		updatedAt: new Date('2026-06-01T00:00:00Z')
	};

	test('状態を遷移でき監査に残る(BR-CONTENT-007)', async () => {
		const { service, auditRepo } = setup([base]);
		const updated = await service.updateStatus(SUPPORT, 'iq-1', InquiryStatus.IN_PROGRESS);
		expect(updated.status).toBe(InquiryStatus.IN_PROGRESS);
		expect(auditRepo.records.some((r) => r.eventType === 'inquiry.updated')).toBe(true);
	});

	test('不正な遷移は ValidationError、存在しない ID は NotFound', async () => {
		const { service } = setup([base]);
		await expect(service.updateStatus(SUPPORT, 'iq-1', InquiryStatus.OPEN)).rejects.toThrow(
			ValidationError
		);
		await expect(service.updateStatus(SUPPORT, 'missing', InquiryStatus.CLOSED)).rejects.toThrow(
			NotFoundError
		);
	});
});

describe('EmailNotificationService', () => {
	function setup() {
		const notifications = new InMemoryEmailNotificationRepository();
		const recipients = new FakeEmailRecipientRepository(
			['a@example.com', 'b@example.com'],
			['a@example.com']
		);
		const mail = new RecordingMailSender();
		const { repo, recorder } = audit();
		const service = new EmailNotificationService({
			notifications,
			recipients,
			mail,
			audit: recorder,
			clock: new FakeClock(),
			ids: new FakeIdGenerator('em')
		});
		return { service, mail, auditRepo: repo };
	}

	test('不正なテンプレートキーは ValidationError', async () => {
		const { service } = setup();
		await expect(
			service.createDraft(MOD, {
				subject: 'お知らせ',
				templateKey: 'nope',
				targetCondition: EmailTargetCondition.ALL
			})
		).rejects.toThrow(ValidationError);
	});

	test('配信で対象全員に送られ、配信済みになり監査に残る(AC-CONTENT-003)', async () => {
		const { service, mail, auditRepo } = setup();
		const draft = await service.createDraft(MOD, {
			subject: '新機能のお知らせ',
			templateKey: 'feature_update',
			targetCondition: EmailTargetCondition.ALL
		});

		const result = await service.send(MOD, draft.id);

		expect(result.recipientCount).toBe(2);
		expect(mail.sent).toHaveLength(2);
		const sent = auditRepo.records.find((r) => r.eventType === 'email.sent');
		expect(sent?.metadata).toMatchObject({ recipientCount: 2, targetCondition: 'all' });
	});

	test('verified 条件は確認済みのみに送る', async () => {
		const { service, mail } = setup();
		const draft = await service.createDraft(MOD, {
			subject: 'x',
			templateKey: 'announcement',
			targetCondition: EmailTargetCondition.VERIFIED
		});
		await service.send(MOD, draft.id);
		expect(mail.sent).toHaveLength(1);
	});

	test('配信済みの再送は ValidationError', async () => {
		const { service } = setup();
		const draft = await service.createDraft(MOD, {
			subject: 'x',
			templateKey: 'announcement',
			targetCondition: EmailTargetCondition.ALL
		});
		await service.send(MOD, draft.id);
		await expect(service.send(MOD, draft.id)).rejects.toThrow(ValidationError);
	});

	test('テスト送信は 1 通だけ送り状態を変えない', async () => {
		const { service, mail } = setup();
		const draft = await service.createDraft(MOD, {
			subject: 'x',
			templateKey: 'announcement',
			targetCondition: EmailTargetCondition.ALL
		});
		await service.testSend(MOD, draft.id, 'tester@example.com');
		expect(mail.sent).toHaveLength(1);
		expect((await service.list(MOD))[0].status).toBe('draft');
	});
});
