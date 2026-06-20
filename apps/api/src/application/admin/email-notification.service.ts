// メール通知のユースケース(BR-CONTENT-003)。moderator 以上(EMAIL_SEND)が作成・テスト送信・配信する。
// 送信は監査ログに記録する。お知らせ系メールはオプトアウト対象(受信者解決は EmailRecipientRepository)。
import { AdminPermission, assertCan } from '../../domain/admin-role';
import { AuditActorType, AuditEventType } from '../../domain/audit-event';
import { EmailNotificationStatus, EmailTargetCondition } from '../../domain/content';
import { assertValidTemplateKey, renderEmailHtml } from '../../domain/email-templates';
import { NotFoundError, ValidationError } from '../../domain/errors';
import { isValidEmail } from '../../domain/admin-credentials';
import { Clock, IdGenerator } from '../gateways';
import { AuditRecorder } from './audit-recorder';
import {
	EmailNotificationRepository,
	EmailRecipientRepository,
	MailSender
} from './content-gateways';
import { EmailNotificationRecord, EmailSendResult } from './content-models';
import { AdminPrincipal } from './models';

export interface EmailNotificationServiceDeps {
	readonly notifications: EmailNotificationRepository;
	readonly recipients: EmailRecipientRepository;
	readonly mail: MailSender;
	readonly audit: AuditRecorder;
	readonly clock: Clock;
	readonly ids: IdGenerator;
}

export interface EmailNotificationInput {
	readonly subject: string;
	readonly templateKey: string;
	readonly targetCondition: EmailTargetCondition;
}

export class EmailNotificationService {
	constructor(private readonly deps: EmailNotificationServiceDeps) {}

	async list(actor: AdminPrincipal): Promise<EmailNotificationRecord[]> {
		assertCan(actor.role, AdminPermission.VIEW_CONTENT);
		return this.deps.notifications.list();
	}

	async createDraft(
		actor: AdminPrincipal,
		input: EmailNotificationInput
	): Promise<EmailNotificationRecord> {
		assertCan(actor.role, AdminPermission.EMAIL_SEND);
		if (input.subject.trim().length === 0) {
			throw new ValidationError('件名を入力してください。', [
				{ field: 'subject', message: '必須項目です。' }
			]);
		}
		assertValidTemplateKey(input.templateKey);
		const record: EmailNotificationRecord = {
			id: this.deps.ids.ulid(),
			subject: input.subject.trim(),
			templateKey: input.templateKey,
			targetCondition: input.targetCondition,
			status: EmailNotificationStatus.DRAFT,
			createdBy: actor.adminId,
			sentAt: null,
			createdAt: this.deps.clock.now()
		};
		await this.deps.notifications.save(record);
		return record;
	}

	/** 配信前の確認用テスト送信(対象は指定の 1 アドレス。状態は変えない、AC-CONTENT-003)。 */
	async testSend(actor: AdminPrincipal, id: string, toEmail: string): Promise<void> {
		assertCan(actor.role, AdminPermission.EMAIL_SEND);
		if (!isValidEmail(toEmail)) {
			throw new ValidationError('テスト送信先のメールアドレスが不正です。');
		}
		const record = await this.require(id);
		await this.deps.mail.send({
			to: toEmail,
			subject: `[テスト] ${record.subject}`,
			html: renderEmailHtml(record.templateKey, record.subject)
		});
	}

	/** 対象利用者へ配信し、配信を監査ログに記録する(AC-CONTENT-003)。 */
	async send(actor: AdminPrincipal, id: string): Promise<EmailSendResult> {
		assertCan(actor.role, AdminPermission.EMAIL_SEND);
		const record = await this.require(id);
		if (record.status === EmailNotificationStatus.SENT) {
			throw new ValidationError('この通知は既に配信済みです。');
		}
		const recipients = await this.deps.recipients.listRecipientEmails(record.targetCondition);
		const html = renderEmailHtml(record.templateKey, record.subject);
		for (const to of recipients) {
			await this.deps.mail.send({ to, subject: record.subject, html });
		}

		const now = this.deps.clock.now();
		await this.deps.notifications.save({
			...record,
			status: EmailNotificationStatus.SENT,
			sentAt: now
		});
		await this.deps.audit.record({
			eventType: AuditEventType.EMAIL_SENT,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'email_notification',
			targetId: id,
			metadata: {
				recipientCount: recipients.length,
				targetCondition: record.targetCondition,
				templateKey: record.templateKey
			}
		});
		return { recipientCount: recipients.length };
	}

	private async require(id: string): Promise<EmailNotificationRecord> {
		const record = await this.deps.notifications.findById(id);
		if (!record) {
			throw new NotFoundError('対象のメール通知が見つかりません。');
		}
		return record;
	}
}
