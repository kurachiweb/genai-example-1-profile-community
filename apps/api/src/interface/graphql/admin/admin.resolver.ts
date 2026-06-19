// 管理者 GraphQL リゾルバ(Interface Adapters / Controller)。薄く保ち、入出力変換とユースケース呼び出しに徹する。
// 認可(RBAC)・整合・監査はユースケース層が担う(coding/04-nestjs.md §3)。
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminRole } from '../../../domain/admin-role';
import { ReportStatus, UnfreezeRequestStatus } from '../../../domain/moderation';
import { UserStatus } from '../../../domain/user-status';
import { AdminAccountService } from '../../../application/admin/admin-account.service';
import { AdminAuthService } from '../../../application/admin/admin-auth.service';
import { AdminWebauthnService } from '../../../application/admin/admin-webauthn.service';
import { ApiKeyAdminService } from '../../../application/admin/api-key-admin.service';
import { AuditLogService } from '../../../application/admin/audit-log.service';
import { ModerationService } from '../../../application/admin/moderation.service';
import { StatsService } from '../../../application/admin/stats.service';
import { UserAdminService } from '../../../application/admin/user-admin.service';
import { AuditLogView } from '../../../application/admin/models';
import { AdminContextProvider, RequestLike } from './admin-context.provider';
import {
	AdminAuditLogsArgs,
	AdminChangeRoleInput,
	AdminCreateAdminInput,
	AdminFinishPasskeyRegistrationInput,
	AdminFreezeUserInput,
	AdminLoginInput,
	AdminPasskeyAuthInput,
	AdminReportsArgs,
	AdminReviewReportInput,
	AdminReviewUnfreezeInput,
	AdminUnfreezeRequestsArgs,
	AdminUsersArgs
} from './inputs';
import {
	AdminAccountType,
	AdminLoginResultType,
	AdminMeType,
	AdminStatsType,
	ApiKeyMetaType,
	AuditLogConnectionType,
	AuditLogType,
	PasskeyType,
	ReportType,
	UnfreezeRequestType,
	UserConnectionType,
	UserSummaryType
} from './types';

interface GraphQLContext {
	readonly req?: RequestLike;
}

function presentAuditLog(view: AuditLogView): AuditLogType {
	return {
		id: view.id,
		eventType: view.eventType,
		actorType: view.actorType,
		actorId: view.actorId,
		targetType: view.targetType,
		targetId: view.targetId,
		result: view.result,
		metadataJson: view.metadata ? JSON.stringify(view.metadata) : null,
		occurredAt: view.occurredAt
	};
}

@Resolver()
export class AdminResolver {
	constructor(
		private readonly context: AdminContextProvider,
		private readonly auth: AdminAuthService,
		private readonly webauthn: AdminWebauthnService,
		private readonly admins: AdminAccountService,
		private readonly users: UserAdminService,
		private readonly moderation: ModerationService,
		private readonly apiKeys: ApiKeyAdminService,
		private readonly stats: StatsService,
		private readonly auditLogs: AuditLogService
	) {}

	// --- 認証(主体不要) ---

	@Mutation(() => AdminLoginResultType, { name: 'adminLogin' })
	async adminLogin(@Args('input') input: AdminLoginInput): Promise<AdminLoginResultType> {
		const { session, principal } = await this.auth.login(input);
		return {
			sessionId: session.sessionId,
			csrfToken: session.csrfToken,
			adminId: principal.adminId,
			role: principal.role
		};
	}

	@Mutation(() => Boolean, { name: 'adminLogout' })
	async adminLogout(@Context() ctx: GraphQLContext): Promise<boolean> {
		const sessionId = this.context.sessionId(ctx.req);
		if (sessionId) {
			const resolved = await this.auth.resolvePrincipal(sessionId);
			await this.auth.logout(sessionId, resolved?.principal.adminId ?? null);
		}
		return true;
	}

	@Mutation(() => String, { name: 'adminStartPasskeyAuthentication' })
	async adminStartPasskeyAuthentication(@Args('email') email: string): Promise<string> {
		return JSON.stringify(await this.webauthn.startAuthentication(email));
	}

	@Mutation(() => AdminLoginResultType, { name: 'adminFinishPasskeyAuthentication' })
	async adminFinishPasskeyAuthentication(
		@Args('input') input: AdminPasskeyAuthInput
	): Promise<AdminLoginResultType> {
		const responseJson = JSON.parse(input.responseJson) as Record<string, unknown>;
		const { session, principal } = await this.webauthn.finishAuthentication(
			input.email,
			responseJson
		);
		return {
			sessionId: session.sessionId,
			csrfToken: session.csrfToken,
			adminId: principal.adminId,
			role: principal.role
		};
	}

	// --- 自分 ---

	@Query(() => AdminMeType, { name: 'adminMe' })
	async adminMe(@Context() ctx: GraphQLContext): Promise<AdminMeType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return { adminId: principal.adminId, role: principal.role };
	}

	// --- 統計・監査 ---

	@Query(() => AdminStatsType, { name: 'adminStats' })
	async adminStats(@Context() ctx: GraphQLContext): Promise<AdminStatsType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return this.stats.getStats(principal);
	}

	@Query(() => AuditLogConnectionType, { name: 'adminAuditLogs' })
	async adminAuditLogs(
		@Args() args: AdminAuditLogsArgs,
		@Context() ctx: GraphQLContext
	): Promise<AuditLogConnectionType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		const result = await this.auditLogs.list(principal, {
			actorType: args.actorType as 'admin' | 'user' | 'system' | undefined,
			eventType: args.eventType as never,
			targetId: args.targetId,
			limit: args.limit,
			offset: args.offset
		});
		return { logs: result.logs.map(presentAuditLog), total: result.total };
	}

	// --- ユーザー管理 ---

	@Query(() => UserConnectionType, { name: 'adminUsers' })
	async adminUsers(
		@Args() args: AdminUsersArgs,
		@Context() ctx: GraphQLContext
	): Promise<UserConnectionType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		const result = await this.users.listUsers(principal, {
			search: args.search,
			status: args.status as UserStatus | undefined,
			limit: args.limit,
			offset: args.offset
		});
		return { users: [...result.users], total: result.total };
	}

	@Query(() => UserSummaryType, { name: 'adminUser' })
	async adminUser(
		@Args('id') id: string,
		@Context() ctx: GraphQLContext
	): Promise<UserSummaryType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return this.users.getUser(principal, id);
	}

	// --- モデレーション ---

	@Mutation(() => UserSummaryType, { name: 'adminFreezeUser' })
	async adminFreezeUser(
		@Args('input') input: AdminFreezeUserInput,
		@Context() ctx: GraphQLContext
	): Promise<UserSummaryType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return this.moderation.freezeUser(principal, input.userId, input.reasonCategory);
	}

	@Mutation(() => UserSummaryType, { name: 'adminDeleteIcon' })
	async adminDeleteIcon(
		@Args('userId') userId: string,
		@Context() ctx: GraphQLContext
	): Promise<UserSummaryType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return this.moderation.deleteIcon(principal, userId);
	}

	@Query(() => [ReportType], { name: 'adminReports' })
	async adminReports(
		@Args() args: AdminReportsArgs,
		@Context() ctx: GraphQLContext
	): Promise<ReportType[]> {
		const principal = await this.context.requirePrincipal(ctx.req);
		const list = await this.moderation.listReports(
			principal,
			args.status as ReportStatus | undefined
		);
		return list.map((report) => ({
			id: report.id,
			targetUserId: report.targetUserId,
			targetHandle: report.targetHandle,
			reasonCategory: report.reasonCategory,
			detail: report.detail,
			status: report.status,
			duplicateCount: report.duplicateCount,
			createdAt: report.createdAt,
			updatedAt: report.updatedAt
		}));
	}

	@Mutation(() => Boolean, { name: 'adminReviewReport' })
	async adminReviewReport(
		@Args('input') input: AdminReviewReportInput,
		@Context() ctx: GraphQLContext
	): Promise<boolean> {
		const principal = await this.context.requirePrincipal(ctx.req);
		await this.moderation.reviewReport(
			principal,
			input.reportId,
			input.decision as typeof ReportStatus.RESOLVED | typeof ReportStatus.DISMISSED
		);
		return true;
	}

	@Query(() => [UnfreezeRequestType], { name: 'adminUnfreezeRequests' })
	async adminUnfreezeRequests(
		@Args() args: AdminUnfreezeRequestsArgs,
		@Context() ctx: GraphQLContext
	): Promise<UnfreezeRequestType[]> {
		const principal = await this.context.requirePrincipal(ctx.req);
		const list = await this.moderation.listUnfreezeRequests(
			principal,
			args.status as UnfreezeRequestStatus | undefined
		);
		return list.map((request) => ({
			id: request.id,
			userId: request.userId,
			reason: request.reason,
			supplement: request.supplement,
			status: request.status,
			reviewedBy: request.reviewedBy,
			createdAt: request.createdAt,
			reviewedAt: request.reviewedAt
		}));
	}

	@Mutation(() => Boolean, { name: 'adminReviewUnfreezeRequest' })
	async adminReviewUnfreezeRequest(
		@Args('input') input: AdminReviewUnfreezeInput,
		@Context() ctx: GraphQLContext
	): Promise<boolean> {
		const principal = await this.context.requirePrincipal(ctx.req);
		await this.moderation.reviewUnfreezeRequest(principal, input.requestId, input.approve);
		return true;
	}

	// --- API キー運用 ---

	@Query(() => [ApiKeyMetaType], { name: 'adminApiKeys' })
	async adminApiKeys(@Context() ctx: GraphQLContext): Promise<ApiKeyMetaType[]> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return this.apiKeys.listKeys(principal);
	}

	@Query(() => Int, { name: 'adminApiRateLimit' })
	async adminApiRateLimit(@Context() ctx: GraphQLContext): Promise<number> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return this.apiKeys.getRateLimit(principal);
	}

	@Mutation(() => Boolean, { name: 'adminRevokeApiKey' })
	async adminRevokeApiKey(
		@Args('keyId') keyId: string,
		@Context() ctx: GraphQLContext
	): Promise<boolean> {
		const principal = await this.context.requirePrincipal(ctx.req);
		await this.apiKeys.revokeKey(principal, keyId);
		return true;
	}

	@Mutation(() => Int, { name: 'adminSetApiRateLimit' })
	async adminSetApiRateLimit(
		@Args('value', { type: () => Int }) value: number,
		@Context() ctx: GraphQLContext
	): Promise<number> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return this.apiKeys.setRateLimit(principal, value);
	}

	// --- 管理者アカウント・権限 ---

	@Query(() => [AdminAccountType], { name: 'adminAccounts' })
	async adminAccounts(@Context() ctx: GraphQLContext): Promise<AdminAccountType[]> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return this.admins.listAdmins(principal);
	}

	@Mutation(() => AdminAccountType, { name: 'adminCreateAdmin' })
	async adminCreateAdmin(
		@Args('input') input: AdminCreateAdminInput,
		@Context() ctx: GraphQLContext
	): Promise<AdminAccountType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return this.admins.createAdmin(principal, {
			email: input.email,
			password: input.password,
			role: input.role as AdminRole
		});
	}

	@Mutation(() => AdminAccountType, { name: 'adminChangeRole' })
	async adminChangeRole(
		@Args('input') input: AdminChangeRoleInput,
		@Context() ctx: GraphQLContext
	): Promise<AdminAccountType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return this.admins.changeRole(principal, input.targetId, input.role as AdminRole);
	}

	@Mutation(() => AdminAccountType, { name: 'adminDisableAdmin' })
	async adminDisableAdmin(
		@Args('targetId') targetId: string,
		@Context() ctx: GraphQLContext
	): Promise<AdminAccountType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return this.admins.disableAdmin(principal, targetId);
	}

	// --- WebAuthn パスキー(主体必要) ---

	@Query(() => [PasskeyType], { name: 'adminPasskeys' })
	async adminPasskeys(@Context() ctx: GraphQLContext): Promise<PasskeyType[]> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return this.webauthn.listPasskeys(principal);
	}

	@Mutation(() => String, { name: 'adminStartPasskeyRegistration' })
	async adminStartPasskeyRegistration(@Context() ctx: GraphQLContext): Promise<string> {
		const principal = await this.context.requirePrincipal(ctx.req);
		return JSON.stringify(await this.webauthn.startRegistration(principal));
	}

	@Mutation(() => PasskeyType, { name: 'adminFinishPasskeyRegistration' })
	async adminFinishPasskeyRegistration(
		@Args('input') input: AdminFinishPasskeyRegistrationInput,
		@Context() ctx: GraphQLContext
	): Promise<PasskeyType> {
		const principal = await this.context.requirePrincipal(ctx.req);
		const responseJson = JSON.parse(input.responseJson) as Record<string, unknown>;
		return this.webauthn.finishRegistration(principal, responseJson, input.nickname);
	}

	@Mutation(() => Boolean, { name: 'adminDeletePasskey' })
	async adminDeletePasskey(
		@Args('id') id: string,
		@Context() ctx: GraphQLContext
	): Promise<boolean> {
		const principal = await this.context.requirePrincipal(ctx.req);
		await this.webauthn.deletePasskey(principal, id);
		return true;
	}
}
