// ヘルプ記事のユースケース(BR-CONTENT-005)。support 以上(HELP_EDIT)が作成・編集・公開切替できる。
import { AdminPermission, assertCan } from '../../domain/admin-role';
import { AuditActorType, AuditEventType } from '../../domain/audit-event';
import { assertValidSlug, assertValidTitle, HelpArticleStatus } from '../../domain/content';
import { NotFoundError, ValidationError } from '../../domain/errors';
import { Clock, IdGenerator } from '../gateways';
import { AuditRecorder } from './audit-recorder';
import { HelpArticleRepository } from './content-gateways';
import { HelpArticleRecord } from './content-models';
import { AdminPrincipal } from './models';

export interface HelpArticleServiceDeps {
	readonly articles: HelpArticleRepository;
	readonly audit: AuditRecorder;
	readonly clock: Clock;
	readonly ids: IdGenerator;
}

export interface HelpArticleInput {
	readonly id?: string;
	readonly title: string;
	readonly slug: string;
	readonly category?: string | null;
	readonly bodyMarkdown: string;
	readonly status?: HelpArticleStatus;
}

export class HelpArticleService {
	constructor(private readonly deps: HelpArticleServiceDeps) {}

	async list(actor: AdminPrincipal): Promise<HelpArticleRecord[]> {
		assertCan(actor.role, AdminPermission.VIEW_CONTENT);
		return this.deps.articles.list();
	}

	async upsert(actor: AdminPrincipal, input: HelpArticleInput): Promise<HelpArticleRecord> {
		assertCan(actor.role, AdminPermission.HELP_EDIT);
		assertValidTitle(input.title);
		assertValidSlug(input.slug);

		const bySlug = await this.deps.articles.findBySlug(input.slug);
		if (bySlug && bySlug.id !== input.id) {
			throw new ValidationError('このスラッグは既に使用されています。', [
				{ field: 'slug', message: '別のスラッグを指定してください。' }
			]);
		}

		const now = this.deps.clock.now();
		const existing = input.id ? await this.deps.articles.findById(input.id) : null;
		if (input.id && !existing) {
			throw new NotFoundError('対象のヘルプ記事が見つかりません。');
		}

		const record: HelpArticleRecord = {
			id: existing?.id ?? this.deps.ids.ulid(),
			title: input.title.trim(),
			slug: input.slug,
			category: input.category ?? existing?.category ?? null,
			bodyMarkdown: input.bodyMarkdown,
			status: input.status ?? existing?.status ?? HelpArticleStatus.UNPUBLISHED,
			updatedBy: actor.adminId,
			createdAt: existing?.createdAt ?? now,
			updatedAt: now
		};
		await this.deps.articles.save(record);
		await this.deps.audit.record({
			eventType: AuditEventType.HELP_ARTICLE_UPDATED,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'help_article',
			targetId: record.id,
			metadata: { slug: record.slug, status: record.status }
		});
		return record;
	}

	async setStatus(
		actor: AdminPrincipal,
		id: string,
		status: HelpArticleStatus
	): Promise<HelpArticleRecord> {
		assertCan(actor.role, AdminPermission.HELP_EDIT);
		const current = await this.deps.articles.findById(id);
		if (!current) {
			throw new NotFoundError('対象のヘルプ記事が見つかりません。');
		}
		const updated: HelpArticleRecord = {
			...current,
			status,
			updatedBy: actor.adminId,
			updatedAt: this.deps.clock.now()
		};
		await this.deps.articles.save(updated);
		return updated;
	}
}
