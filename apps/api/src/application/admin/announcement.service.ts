// お知らせのユースケース(BR-CONTENT-001/002)。下書きは ANNOUNCEMENT_DRAFT、公開は ANNOUNCEMENT_PUBLISH。
import { AdminPermission, assertCan } from '../../domain/admin-role';
import { AuditActorType, AuditEventType } from '../../domain/audit-event';
import { AnnouncementImportance, AnnouncementStatus, assertValidTitle } from '../../domain/content';
import { NotFoundError, ValidationError } from '../../domain/errors';
import { Clock, IdGenerator } from '../gateways';
import { AuditRecorder } from './audit-recorder';
import { AnnouncementRepository } from './content-gateways';
import { AnnouncementRecord } from './content-models';
import { AdminPrincipal } from './models';

export interface AnnouncementServiceDeps {
	readonly announcements: AnnouncementRepository;
	readonly audit: AuditRecorder;
	readonly clock: Clock;
	readonly ids: IdGenerator;
}

export interface AnnouncementInput {
	readonly title: string;
	readonly bodyMarkdown: string;
	readonly importance?: AnnouncementImportance;
	readonly publishStartAt?: Date | null;
	readonly publishEndAt?: Date | null;
}

export class AnnouncementService {
	constructor(private readonly deps: AnnouncementServiceDeps) {}

	async list(actor: AdminPrincipal): Promise<AnnouncementRecord[]> {
		assertCan(actor.role, AdminPermission.VIEW_CONTENT);
		return this.deps.announcements.list();
	}

	async create(actor: AdminPrincipal, input: AnnouncementInput): Promise<AnnouncementRecord> {
		assertCan(actor.role, AdminPermission.ANNOUNCEMENT_DRAFT);
		assertValidTitle(input.title);
		const now = this.deps.clock.now();
		const record: AnnouncementRecord = {
			id: this.deps.ids.ulid(),
			title: input.title.trim(),
			bodyMarkdown: input.bodyMarkdown,
			status: AnnouncementStatus.DRAFT,
			importance: input.importance ?? AnnouncementImportance.NORMAL,
			publishStartAt: input.publishStartAt ?? null,
			publishEndAt: input.publishEndAt ?? null,
			createdBy: actor.adminId,
			createdAt: now,
			updatedAt: now
		};
		await this.deps.announcements.save(record);
		return record;
	}

	async update(
		actor: AdminPrincipal,
		id: string,
		input: AnnouncementInput
	): Promise<AnnouncementRecord> {
		assertCan(actor.role, AdminPermission.ANNOUNCEMENT_DRAFT);
		const current = await this.require(id);
		assertValidTitle(input.title);
		const updated: AnnouncementRecord = {
			...current,
			title: input.title.trim(),
			bodyMarkdown: input.bodyMarkdown,
			importance: input.importance ?? current.importance,
			publishStartAt: input.publishStartAt ?? null,
			publishEndAt: input.publishEndAt ?? null,
			updatedAt: this.deps.clock.now()
		};
		await this.deps.announcements.save(updated);
		return updated;
	}

	async publish(actor: AdminPrincipal, id: string): Promise<AnnouncementRecord> {
		assertCan(actor.role, AdminPermission.ANNOUNCEMENT_PUBLISH);
		const current = await this.require(id);
		const now = this.deps.clock.now();
		const updated: AnnouncementRecord = {
			...current,
			status: AnnouncementStatus.PUBLISHED,
			// 公開開始日時が未指定なら即時公開とする(AC-CONTENT-001)。
			publishStartAt: current.publishStartAt ?? now,
			updatedAt: now
		};
		await this.deps.announcements.save(updated);
		await this.deps.audit.record({
			eventType: AuditEventType.ANNOUNCEMENT_PUBLISHED,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'announcement',
			targetId: id,
			metadata: { title: updated.title }
		});
		return updated;
	}

	async unpublish(actor: AdminPrincipal, id: string): Promise<AnnouncementRecord> {
		assertCan(actor.role, AdminPermission.ANNOUNCEMENT_PUBLISH);
		const current = await this.require(id);
		const updated: AnnouncementRecord = {
			...current,
			status: AnnouncementStatus.DRAFT,
			updatedAt: this.deps.clock.now()
		};
		await this.deps.announcements.save(updated);
		return updated;
	}

	async remove(actor: AdminPrincipal, id: string): Promise<void> {
		assertCan(actor.role, AdminPermission.ANNOUNCEMENT_DRAFT);
		const current = await this.require(id);
		if (current.status === AnnouncementStatus.PUBLISHED) {
			throw new ValidationError('公開中のお知らせは削除できません。先に非公開にしてください。');
		}
		await this.deps.announcements.delete(id);
	}

	private async require(id: string): Promise<AnnouncementRecord> {
		const record = await this.deps.announcements.findById(id);
		if (!record) {
			throw new NotFoundError('対象のお知らせが見つかりません。');
		}
		return record;
	}
}
