// 問い合わせ対応のユースケース(BR-CONTENT-006/007)。support 以上(INQUIRY_HANDLE)が状態管理する。
// report/unfreeze カテゴリのライフサイクル本体は features/06(本サービスは状態管理のみ)。
import { AdminPermission, assertCan } from '../../domain/admin-role';
import { AuditActorType, AuditEventType } from '../../domain/audit-event';
import { assertInquiryTransition, InquiryStatus } from '../../domain/content';
import { NotFoundError } from '../../domain/errors';
import { Clock } from '../gateways';
import { AuditRecorder } from './audit-recorder';
import { InquiryRepository } from './content-gateways';
import { InquiryRecord } from './content-models';
import { AdminPrincipal } from './models';

export interface InquiryServiceDeps {
	readonly inquiries: InquiryRepository;
	readonly audit: AuditRecorder;
	readonly clock: Clock;
}

export class InquiryService {
	constructor(private readonly deps: InquiryServiceDeps) {}

	async list(
		actor: AdminPrincipal,
		filter: { status?: InquiryStatus; category?: string } = {}
	): Promise<InquiryRecord[]> {
		assertCan(actor.role, AdminPermission.VIEW_INQUIRIES);
		return this.deps.inquiries.list(filter);
	}

	async updateStatus(
		actor: AdminPrincipal,
		id: string,
		status: InquiryStatus
	): Promise<InquiryRecord> {
		assertCan(actor.role, AdminPermission.INQUIRY_HANDLE);
		const current = await this.deps.inquiries.findById(id);
		if (!current) {
			throw new NotFoundError('対象の問い合わせが見つかりません。');
		}
		assertInquiryTransition(current.status, status);
		const now = this.deps.clock.now();
		await this.deps.inquiries.setStatus(id, status, now);
		await this.deps.audit.record({
			eventType: AuditEventType.INQUIRY_UPDATED,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'inquiry',
			targetId: id,
			metadata: { from: current.status, to: status }
		});
		return { ...current, status, updatedAt: now };
	}
}
