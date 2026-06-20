// §08 コンテンツ系 Gateway の MikroORM 実装(Announcement/Help/Policy/Inquiry/EmailNotification/EmailRecipient)。
import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import {
	AnnouncementImportance,
	AnnouncementStatus,
	EmailNotificationStatus,
	EmailTargetCondition,
	HelpArticleStatus,
	InquiryCategory,
	InquiryStatus,
	PolicyType
} from '../../domain/content';
import { UserStatus } from '../../domain/user-status';
import {
	AnnouncementRepository,
	EmailNotificationRepository,
	EmailRecipientRepository,
	HelpArticleRepository,
	InquiryRepository,
	PolicyRepository
} from '../../application/admin/content-gateways';
import {
	AnnouncementRecord,
	EmailNotificationRecord,
	HelpArticleRecord,
	InquiryRecord,
	PolicyRecord
} from '../../application/admin/content-models';
import { AnnouncementEntity } from './entities/announcement.entity';
import { EmailNotificationEntity } from './entities/email-notification.entity';
import { HelpArticleEntity } from './entities/help-article.entity';
import { InquiryEntity } from './entities/inquiry.entity';
import { PolicyEntity } from './entities/policy.entity';
import { UserEntity } from './entities/user.entity';

function announcement(entity: AnnouncementEntity): AnnouncementRecord {
	return {
		id: entity.id,
		title: entity.title,
		bodyMarkdown: entity.bodyMarkdown,
		status: (entity.status ?? AnnouncementStatus.DRAFT) as AnnouncementStatus,
		importance: (entity.importance ?? AnnouncementImportance.NORMAL) as AnnouncementImportance,
		publishStartAt: entity.publishStartAt,
		publishEndAt: entity.publishEndAt,
		createdBy: entity.createdBy,
		createdAt: entity.createdAt as Date,
		updatedAt: entity.updatedAt as Date
	};
}

@Injectable()
export class MikroAnnouncementRepository implements AnnouncementRepository {
	constructor(private readonly em: EntityManager) {}
	async list(): Promise<AnnouncementRecord[]> {
		const rows = await this.em
			.fork()
			.find(AnnouncementEntity, {}, { orderBy: { createdAt: 'desc' } });
		return rows.map(announcement);
	}
	async findById(id: string): Promise<AnnouncementRecord | null> {
		const entity = await this.em.fork().findOne(AnnouncementEntity, { id });
		return entity ? announcement(entity) : null;
	}
	async save(record: AnnouncementRecord): Promise<void> {
		const em = this.em.fork();
		const existing = await em.findOne(AnnouncementEntity, { id: record.id });
		if (existing) {
			Object.assign(existing, {
				title: record.title,
				bodyMarkdown: record.bodyMarkdown,
				status: record.status,
				importance: record.importance,
				publishStartAt: record.publishStartAt,
				publishEndAt: record.publishEndAt
			});
			await em.flush();
			return;
		}
		await em.persist(em.create(AnnouncementEntity, { ...record })).flush();
	}
	async delete(id: string): Promise<void> {
		await this.em.fork().nativeDelete(AnnouncementEntity, { id });
	}
}

function helpArticle(entity: HelpArticleEntity): HelpArticleRecord {
	return {
		id: entity.id,
		title: entity.title,
		slug: entity.slug,
		category: entity.category,
		bodyMarkdown: entity.bodyMarkdown,
		status: (entity.status ?? HelpArticleStatus.UNPUBLISHED) as HelpArticleStatus,
		updatedBy: entity.updatedBy,
		createdAt: entity.createdAt as Date,
		updatedAt: entity.updatedAt as Date
	};
}

@Injectable()
export class MikroHelpArticleRepository implements HelpArticleRepository {
	constructor(private readonly em: EntityManager) {}
	async list(): Promise<HelpArticleRecord[]> {
		const rows = await this.em
			.fork()
			.find(HelpArticleEntity, {}, { orderBy: { updatedAt: 'desc' } });
		return rows.map(helpArticle);
	}
	async findById(id: string): Promise<HelpArticleRecord | null> {
		const entity = await this.em.fork().findOne(HelpArticleEntity, { id });
		return entity ? helpArticle(entity) : null;
	}
	async findBySlug(slug: string): Promise<HelpArticleRecord | null> {
		const entity = await this.em.fork().findOne(HelpArticleEntity, { slug });
		return entity ? helpArticle(entity) : null;
	}
	async save(record: HelpArticleRecord): Promise<void> {
		const em = this.em.fork();
		const existing = await em.findOne(HelpArticleEntity, { id: record.id });
		if (existing) {
			Object.assign(existing, {
				title: record.title,
				slug: record.slug,
				category: record.category,
				bodyMarkdown: record.bodyMarkdown,
				status: record.status,
				updatedBy: record.updatedBy
			});
			await em.flush();
			return;
		}
		await em.persist(em.create(HelpArticleEntity, { ...record })).flush();
	}
}

function policy(entity: PolicyEntity): PolicyRecord {
	return {
		id: entity.id,
		type: entity.type as PolicyType,
		version: entity.version,
		bodyMarkdown: entity.bodyMarkdown,
		isPublished: entity.isPublished ?? false,
		requiresReconsent: entity.requiresReconsent ?? false,
		effectiveDate: entity.effectiveDate,
		editedBy: entity.editedBy,
		createdAt: entity.createdAt as Date
	};
}

@Injectable()
export class MikroPolicyRepository implements PolicyRepository {
	constructor(private readonly em: EntityManager) {}
	async listByType(type: PolicyType): Promise<PolicyRecord[]> {
		const rows = await this.em
			.fork()
			.find(PolicyEntity, { type }, { orderBy: { version: 'desc' } });
		return rows.map(policy);
	}
	async findById(id: string): Promise<PolicyRecord | null> {
		const entity = await this.em.fork().findOne(PolicyEntity, { id });
		return entity ? policy(entity) : null;
	}
	async maxVersion(type: PolicyType): Promise<number> {
		const latest = await this.em
			.fork()
			.findOne(PolicyEntity, { type }, { orderBy: { version: 'desc' } });
		return latest?.version ?? 0;
	}
	async save(record: PolicyRecord): Promise<void> {
		const em = this.em.fork();
		await em.persist(em.create(PolicyEntity, { ...record })).flush();
	}
	async publish(id: string, type: PolicyType): Promise<void> {
		const em = this.em.fork();
		// 同 type を一旦すべて非公開にし、当該版のみ公開中にする(公開中は 1 版のみ)。
		await em.nativeUpdate(PolicyEntity, { type }, { isPublished: false });
		await em.nativeUpdate(PolicyEntity, { id }, { isPublished: true });
	}
}

function inquiry(entity: InquiryEntity): InquiryRecord {
	return {
		id: entity.id,
		category: entity.category as InquiryCategory,
		subject: entity.subject,
		body: entity.body,
		contactEmail: entity.contactEmail,
		status: (entity.status ?? InquiryStatus.OPEN) as InquiryStatus,
		createdByUserId: entity.createdByUserId,
		createdAt: entity.createdAt as Date,
		updatedAt: entity.updatedAt as Date
	};
}

@Injectable()
export class MikroInquiryRepository implements InquiryRepository {
	constructor(private readonly em: EntityManager) {}
	async list(filter: { status?: InquiryStatus; category?: string }): Promise<InquiryRecord[]> {
		const where: FilterQuery<InquiryEntity> = {};
		if (filter.status) where.status = filter.status;
		if (filter.category) where.category = filter.category;
		const rows = await this.em
			.fork()
			.find(InquiryEntity, where, { orderBy: { createdAt: 'desc' } });
		return rows.map(inquiry);
	}
	async findById(id: string): Promise<InquiryRecord | null> {
		const entity = await this.em.fork().findOne(InquiryEntity, { id });
		return entity ? inquiry(entity) : null;
	}
	async setStatus(id: string, status: InquiryStatus, updatedAt: Date): Promise<void> {
		await this.em.fork().nativeUpdate(InquiryEntity, { id }, { status, updatedAt });
	}
}

function emailNotification(entity: EmailNotificationEntity): EmailNotificationRecord {
	return {
		id: entity.id,
		subject: entity.subject,
		templateKey: entity.templateKey,
		targetCondition: entity.targetCondition as EmailTargetCondition,
		status: (entity.status ?? EmailNotificationStatus.DRAFT) as EmailNotificationStatus,
		createdBy: entity.createdBy,
		sentAt: entity.sentAt,
		createdAt: entity.createdAt as Date
	};
}

@Injectable()
export class MikroEmailNotificationRepository implements EmailNotificationRepository {
	constructor(private readonly em: EntityManager) {}
	async list(): Promise<EmailNotificationRecord[]> {
		const rows = await this.em
			.fork()
			.find(EmailNotificationEntity, {}, { orderBy: { createdAt: 'desc' } });
		return rows.map(emailNotification);
	}
	async findById(id: string): Promise<EmailNotificationRecord | null> {
		const entity = await this.em.fork().findOne(EmailNotificationEntity, { id });
		return entity ? emailNotification(entity) : null;
	}
	async save(record: EmailNotificationRecord): Promise<void> {
		const em = this.em.fork();
		const existing = await em.findOne(EmailNotificationEntity, { id: record.id });
		if (existing) {
			Object.assign(existing, { status: record.status, sentAt: record.sentAt });
			await em.flush();
			return;
		}
		await em.persist(em.create(EmailNotificationEntity, { ...record })).flush();
	}
}

@Injectable()
export class MikroEmailRecipientRepository implements EmailRecipientRepository {
	constructor(private readonly em: EntityManager) {}
	async listRecipientEmails(condition: EmailTargetCondition): Promise<string[]> {
		// お知らせ系メールはオプトイン者のみ(BR-CONTENT-004)。verified は ACTIVE、all は退会以外。
		const where: FilterQuery<UserEntity> =
			condition === EmailTargetCondition.VERIFIED
				? { announcementEmailOptIn: true, status: UserStatus.ACTIVE }
				: {
						announcementEmailOptIn: true,
						status: { $in: [UserStatus.ACTIVE, UserStatus.UNVERIFIED] }
					};
		const rows = await this.em.fork().find(UserEntity, where, { fields: ['email'] });
		return rows.map((row) => row.email);
	}
}
