// StatsRepository(Gateway)の MikroORM 実装。集計値のみを返す(BR-ADMIN-009)。
import { Injectable } from '@nestjs/common';
import { ReportStatus, UnfreezeRequestStatus } from '../../domain/moderation';
import { UserStatus } from '../../domain/user-status';
import { StatsRepository } from '../../application/admin/gateways';
import { AdminStats } from '../../application/admin/models';
import { MikroAdminUserRepository } from './admin-user.repository';
import { MikroApiKeyAdminRepository } from './api-key-admin.repository';
import { MikroReportRepository, MikroUnfreezeRequestRepository } from './moderation.repositories';

@Injectable()
export class MikroStatsRepository implements StatsRepository {
	constructor(
		private readonly users: MikroAdminUserRepository,
		private readonly apiKeys: MikroApiKeyAdminRepository,
		private readonly reports: MikroReportRepository,
		private readonly unfreezeRequests: MikroUnfreezeRequestRepository
	) {}

	async collect(): Promise<AdminStats> {
		const [
			totalUsers,
			activeUsers,
			unverifiedUsers,
			frozenUsers,
			withdrawnUsers,
			effectivePublicProfiles,
			openReports,
			pendingUnfreezeRequests,
			activeApiKeys
		] = await Promise.all([
			this.users.countAll(),
			this.users.countByStatus(UserStatus.ACTIVE),
			this.users.countByStatus(UserStatus.UNVERIFIED),
			this.users.countByStatus(UserStatus.FROZEN),
			this.users.countByStatus(UserStatus.WITHDRAWN),
			this.users.countEffectivePublic(),
			this.reports.countByStatus(ReportStatus.OPEN),
			this.unfreezeRequests.countByStatus(UnfreezeRequestStatus.PENDING),
			this.apiKeys.countActive()
		]);
		return {
			totalUsers,
			activeUsers,
			unverifiedUsers,
			frozenUsers,
			withdrawnUsers,
			effectivePublicProfiles,
			openReports,
			pendingUnfreezeRequests,
			activeApiKeys
		};
	}
}
