// 利用統計の閲覧ユースケース(BR-ADMIN-009)。集計値のみを返し、不要な個人特定を伴わない。
import { AdminPermission, assertCan } from '../../domain/admin-role';
import { StatsRepository } from './gateways';
import { AdminPrincipal, AdminStats } from './models';

export interface StatsServiceDeps {
	readonly stats: StatsRepository;
}

export class StatsService {
	constructor(private readonly deps: StatsServiceDeps) {}

	async getStats(actor: AdminPrincipal): Promise<AdminStats> {
		assertCan(actor.role, AdminPermission.VIEW_STATS);
		return this.deps.stats.collect();
	}
}
