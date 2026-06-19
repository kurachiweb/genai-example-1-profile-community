// モデレーションのユースケース(BR-ADMIN-005/006・features/06)。
// 凍結・アイコン削除・通報審査・解除リクエスト審査を、RBAC と監査記録つきで実行する。
// 状態遷移の整合(凍結で API キー失効、解除でユーザーを ACTIVE へ戻す)を本層で担保する。
import { AdminPermission, assertCan } from '../../domain/admin-role';
import { AuditActorType, AuditEventType } from '../../domain/audit-event';
import { NotFoundError } from '../../domain/errors';
import {
	assertReportTransition,
	assertUnfreezeTransition,
	ReportStatus,
	SuspensionStatus,
	UnfreezeRequestStatus
} from '../../domain/moderation';
import { assertTransition, UserStatus } from '../../domain/user-status';
import { Clock, IdGenerator } from '../gateways';
import { AuditRecorder } from './audit-recorder';
import {
	AdminUserRepository,
	ApiKeyAdminRepository,
	ReportRepository,
	SuspensionRepository,
	UnfreezeRequestRepository
} from './gateways';
import { AdminPrincipal, SuspensionRecord, UserSummary } from './models';

export interface ModerationServiceDeps {
	readonly users: AdminUserRepository;
	readonly suspensions: SuspensionRepository;
	readonly unfreezeRequests: UnfreezeRequestRepository;
	readonly reports: ReportRepository;
	readonly apiKeys: ApiKeyAdminRepository;
	readonly audit: AuditRecorder;
	readonly clock: Clock;
	readonly ids: IdGenerator;
}

export class ModerationService {
	constructor(private readonly deps: ModerationServiceDeps) {}

	/** ユーザーを凍結する。公開停止(実効公開ゲートで自動除外)・API キー失効・凍結記録を行う(AC-ADMIN-006)。 */
	async freezeUser(
		actor: AdminPrincipal,
		userId: string,
		reasonCategory: string
	): Promise<UserSummary> {
		assertCan(actor.role, AdminPermission.MODERATE_FREEZE_USER);
		const status = await this.requireUserStatus(userId);
		assertTransition(status, UserStatus.FROZEN);

		const now = this.deps.clock.now();
		await this.deps.users.setStatus(userId, UserStatus.FROZEN);
		const suspension: SuspensionRecord = {
			id: this.deps.ids.ulid(),
			userId,
			reasonCategory,
			status: SuspensionStatus.ACTIVE,
			suspendedBy: actor.adminId,
			suspendedAt: now,
			liftedAt: null
		};
		await this.deps.suspensions.create(suspension);
		// 凍結時は当該ユーザーの全 API キーを失効する(BR-API-003/BR-SAFE-006)。
		await this.deps.apiKeys.revokeAllForUser(userId, now);

		await this.deps.audit.record({
			eventType: AuditEventType.USER_FROZEN,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'user',
			targetId: userId,
			metadata: { reasonCategory }
		});
		return this.requireSummary(userId);
	}

	/** 不適切アイコンを削除し既定に戻す(AC-ADMIN-005)。 */
	async deleteIcon(actor: AdminPrincipal, userId: string): Promise<UserSummary> {
		assertCan(actor.role, AdminPermission.MODERATE_DELETE_ICON);
		await this.requireUserStatus(userId);
		await this.deps.users.clearIcon(userId);
		await this.deps.audit.record({
			eventType: AuditEventType.USER_ICON_DELETED,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'user',
			targetId: userId
		});
		return this.requireSummary(userId);
	}

	/** 通報を審査・処分する(RESOLVED/DISMISSED、BR-SAFE-005)。 */
	async reviewReport(
		actor: AdminPrincipal,
		reportId: string,
		decision: typeof ReportStatus.RESOLVED | typeof ReportStatus.DISMISSED
	): Promise<void> {
		assertCan(actor.role, AdminPermission.MODERATE_REVIEW_REPORT);
		const report = await this.deps.reports.findById(reportId);
		if (!report) {
			throw new NotFoundError('対象の通報が見つかりません。');
		}
		assertReportTransition(report.status, decision);
		const now = this.deps.clock.now();
		await this.deps.reports.setStatus(reportId, decision, now);
		await this.deps.audit.record({
			eventType: AuditEventType.REPORT_REVIEWED,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'report',
			targetId: reportId,
			metadata: { decision }
		});
	}

	/** 解除リクエストを承認/却下する。承認時はユーザーを ACTIVE に戻す(AC-ADMIN-007)。 */
	async reviewUnfreezeRequest(
		actor: AdminPrincipal,
		requestId: string,
		approve: boolean
	): Promise<void> {
		assertCan(actor.role, AdminPermission.MODERATE_REVIEW_UNFREEZE);
		const request = await this.deps.unfreezeRequests.findById(requestId);
		if (!request) {
			throw new NotFoundError('対象の解除リクエストが見つかりません。');
		}
		const next = approve ? UnfreezeRequestStatus.APPROVED : UnfreezeRequestStatus.REJECTED;
		assertUnfreezeTransition(request.status, next);

		const now = this.deps.clock.now();
		await this.deps.unfreezeRequests.setReviewed(requestId, next, actor.adminId, now);

		if (approve) {
			// 凍結前の公開設定で復帰する(visibility は凍結で変更しないため status 復帰のみで足りる)。
			await this.deps.users.setStatus(request.userId, UserStatus.ACTIVE);
			const active = await this.deps.suspensions.findActiveByUserId(request.userId);
			if (active) {
				await this.deps.suspensions.setStatus(active.id, SuspensionStatus.LIFTED, now);
			}
			await this.deps.audit.record({
				eventType: AuditEventType.USER_UNFROZEN,
				actorType: AuditActorType.ADMIN,
				actorId: actor.adminId,
				targetType: 'user',
				targetId: request.userId
			});
		}
		await this.deps.audit.record({
			eventType: AuditEventType.UNFREEZE_REVIEWED,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'unfreeze_request',
			targetId: requestId,
			metadata: { approved: approve }
		});
	}

	private async requireUserStatus(userId: string): Promise<UserStatus> {
		const status = await this.deps.users.getStatus(userId);
		if (!status) {
			throw new NotFoundError('対象のユーザーが見つかりません。');
		}
		return status;
	}

	private async requireSummary(userId: string): Promise<UserSummary> {
		const summary = await this.deps.users.findSummary(userId);
		if (!summary) {
			throw new NotFoundError('対象のユーザーが見つかりません。');
		}
		return summary;
	}
}
