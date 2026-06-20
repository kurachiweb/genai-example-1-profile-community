// §08 コンテンツ系のテスト用インメモリ・フェイク(本番ロジックではないためカバレッジ対象外)。
import { EmailTargetCondition, InquiryStatus, PolicyType } from '../../domain/content';
import {
	AnnouncementRepository,
	EmailNotificationRepository,
	EmailRecipientRepository,
	HelpArticleRepository,
	InquiryRepository,
	MailMessage,
	MailSender,
	PolicyRepository
} from './content-gateways';
import {
	AnnouncementRecord,
	EmailNotificationRecord,
	HelpArticleRecord,
	InquiryRecord,
	PolicyRecord
} from './content-models';

export class InMemoryAnnouncementRepository implements AnnouncementRepository {
	constructor(private records: AnnouncementRecord[] = []) {}
	async list(): Promise<AnnouncementRecord[]> {
		return [...this.records];
	}
	async findById(id: string): Promise<AnnouncementRecord | null> {
		return this.records.find((r) => r.id === id) ?? null;
	}
	async save(record: AnnouncementRecord): Promise<void> {
		this.records = [...this.records.filter((r) => r.id !== record.id), record];
	}
	async delete(id: string): Promise<void> {
		this.records = this.records.filter((r) => r.id !== id);
	}
}

export class InMemoryHelpArticleRepository implements HelpArticleRepository {
	constructor(private records: HelpArticleRecord[] = []) {}
	async list(): Promise<HelpArticleRecord[]> {
		return [...this.records];
	}
	async findById(id: string): Promise<HelpArticleRecord | null> {
		return this.records.find((r) => r.id === id) ?? null;
	}
	async findBySlug(slug: string): Promise<HelpArticleRecord | null> {
		return this.records.find((r) => r.slug === slug) ?? null;
	}
	async save(record: HelpArticleRecord): Promise<void> {
		this.records = [...this.records.filter((r) => r.id !== record.id), record];
	}
}

export class InMemoryPolicyRepository implements PolicyRepository {
	constructor(private records: PolicyRecord[] = []) {}
	async listByType(type: PolicyType): Promise<PolicyRecord[]> {
		return this.records.filter((r) => r.type === type).sort((a, b) => b.version - a.version);
	}
	async findById(id: string): Promise<PolicyRecord | null> {
		return this.records.find((r) => r.id === id) ?? null;
	}
	async maxVersion(type: PolicyType): Promise<number> {
		return this.records
			.filter((r) => r.type === type)
			.reduce((max, r) => Math.max(max, r.version), 0);
	}
	async save(record: PolicyRecord): Promise<void> {
		this.records = [...this.records.filter((r) => r.id !== record.id), record];
	}
	async publish(id: string, type: PolicyType): Promise<void> {
		this.records = this.records.map((r) =>
			r.type === type ? { ...r, isPublished: r.id === id } : r
		);
	}
}

export class InMemoryInquiryRepository implements InquiryRepository {
	constructor(private records: InquiryRecord[] = []) {}
	async list(filter: { status?: InquiryStatus; category?: string }): Promise<InquiryRecord[]> {
		return this.records.filter((r) => {
			if (filter.status && r.status !== filter.status) return false;
			if (filter.category && r.category !== filter.category) return false;
			return true;
		});
	}
	async findById(id: string): Promise<InquiryRecord | null> {
		return this.records.find((r) => r.id === id) ?? null;
	}
	async setStatus(id: string, status: InquiryStatus, updatedAt: Date): Promise<void> {
		this.records = this.records.map((r) => (r.id === id ? { ...r, status, updatedAt } : r));
	}
}

export class InMemoryEmailNotificationRepository implements EmailNotificationRepository {
	constructor(private records: EmailNotificationRecord[] = []) {}
	async list(): Promise<EmailNotificationRecord[]> {
		return [...this.records];
	}
	async findById(id: string): Promise<EmailNotificationRecord | null> {
		return this.records.find((r) => r.id === id) ?? null;
	}
	async save(record: EmailNotificationRecord): Promise<void> {
		this.records = [...this.records.filter((r) => r.id !== record.id), record];
	}
}

export class FakeEmailRecipientRepository implements EmailRecipientRepository {
	constructor(
		private readonly all: string[] = [],
		private readonly verified: string[] = []
	) {}
	async listRecipientEmails(condition: EmailTargetCondition): Promise<string[]> {
		return condition === EmailTargetCondition.VERIFIED ? [...this.verified] : [...this.all];
	}
}

export class RecordingMailSender implements MailSender {
	readonly sent: MailMessage[] = [];
	async send(message: MailMessage): Promise<void> {
		this.sent.push(message);
	}
}
