// 管理者コンソール機能モジュール。Gateway 実装・ユースケース・リゾルバを束ねる(coding/04-nestjs.md §1)。
// DI トークンで Gateway(IF)と実装を結びつけ、ユースケースは実装に依存しない(依存性逆転)。
import { Module } from '@nestjs/common';
import { loadEnv } from '../../../config/env';
import { CLOCK, Clock, ID_GENERATOR, IdGenerator } from '../../../application/gateways';
import {
	ADMIN_ACCOUNT_REPOSITORY,
	ADMIN_SESSION_STORE,
	ADMIN_USER_REPOSITORY,
	ADMIN_WEBAUTHN_CREDENTIAL_REPOSITORY,
	AdminAccountRepository,
	AdminSessionStore,
	AdminUserRepository,
	AdminWebauthnCredentialRepository,
	API_KEY_ADMIN_REPOSITORY,
	ApiKeyAdminRepository,
	AUDIT_LOG_REPOSITORY,
	AuditLogRepository,
	PASSWORD_HASHER,
	PasswordHasher,
	REPORT_REPOSITORY,
	ReportRepository,
	SETTINGS_REPOSITORY,
	SettingsRepository,
	STATS_REPOSITORY,
	StatsRepository,
	SUSPENSION_REPOSITORY,
	SuspensionRepository,
	UNFREEZE_REQUEST_REPOSITORY,
	UnfreezeRequestRepository,
	WEBAUTHN_CHALLENGE_STORE,
	WEBAUTHN_VERIFIER,
	WebauthnChallengeStore,
	WebauthnVerifier
} from '../../../application/admin/gateways';
import { AdminAccountService } from '../../../application/admin/admin-account.service';
import { AdminAuthService } from '../../../application/admin/admin-auth.service';
import { AdminWebauthnService } from '../../../application/admin/admin-webauthn.service';
import { ApiKeyAdminService } from '../../../application/admin/api-key-admin.service';
import { AuditLogService } from '../../../application/admin/audit-log.service';
import { AuditRecorder } from '../../../application/admin/audit-recorder';
import { ModerationService } from '../../../application/admin/moderation.service';
import { StatsService } from '../../../application/admin/stats.service';
import { UserAdminService } from '../../../application/admin/user-admin.service';
import { SystemClock } from '../../../infrastructure/clock';
import { UlidGenerator } from '../../../infrastructure/id-generator';
import { Argon2idPasswordHasher } from '../../../infrastructure/password-hasher';
import { InMemoryAdminSessionStore } from '../../../infrastructure/admin-session.store';
import { InMemoryWebauthnChallengeStore } from '../../../infrastructure/webauthn-challenge.store';
import { SimpleWebauthnVerifier } from '../../../infrastructure/webauthn-verifier';
import { MikroAdminAccountRepository } from '../../../infrastructure/persistence/admin-account.repository';
import { MikroAdminUserRepository } from '../../../infrastructure/persistence/admin-user.repository';
import { MikroAdminWebauthnCredentialRepository } from '../../../infrastructure/persistence/admin-webauthn-credential.repository';
import { MikroApiKeyAdminRepository } from '../../../infrastructure/persistence/api-key-admin.repository';
import { MikroAuditLogRepository } from '../../../infrastructure/persistence/audit-log.repository';
import {
	MikroReportRepository,
	MikroSuspensionRepository,
	MikroUnfreezeRequestRepository
} from '../../../infrastructure/persistence/moderation.repositories';
import { MikroSettingsRepository } from '../../../infrastructure/persistence/settings.repository';
import { MikroStatsRepository } from '../../../infrastructure/persistence/stats.repository';
import { AdminContextProvider } from './admin-context.provider';
import { AdminResolver } from './admin.resolver';

const WEBAUTHN_CONFIG = Symbol('WebauthnConfig');

@Module({
	providers: [
		// 共有 Gateway(stateless)。
		SystemClock,
		UlidGenerator,
		{ provide: CLOCK, useExisting: SystemClock },
		{ provide: ID_GENERATOR, useExisting: UlidGenerator },

		// 永続化 Gateway 実装(Interface Adapters)。
		MikroAdminAccountRepository,
		MikroAdminWebauthnCredentialRepository,
		MikroAuditLogRepository,
		MikroAdminUserRepository,
		MikroSuspensionRepository,
		MikroUnfreezeRequestRepository,
		MikroReportRepository,
		MikroApiKeyAdminRepository,
		MikroSettingsRepository,
		{ provide: ADMIN_ACCOUNT_REPOSITORY, useExisting: MikroAdminAccountRepository },
		{
			provide: ADMIN_WEBAUTHN_CREDENTIAL_REPOSITORY,
			useExisting: MikroAdminWebauthnCredentialRepository
		},
		{ provide: AUDIT_LOG_REPOSITORY, useExisting: MikroAuditLogRepository },
		{ provide: ADMIN_USER_REPOSITORY, useExisting: MikroAdminUserRepository },
		{ provide: SUSPENSION_REPOSITORY, useExisting: MikroSuspensionRepository },
		{ provide: UNFREEZE_REQUEST_REPOSITORY, useExisting: MikroUnfreezeRequestRepository },
		{ provide: REPORT_REPOSITORY, useExisting: MikroReportRepository },
		{ provide: API_KEY_ADMIN_REPOSITORY, useExisting: MikroApiKeyAdminRepository },
		{ provide: SETTINGS_REPOSITORY, useExisting: MikroSettingsRepository },

		// 統計リポジトリは複数の具体リポジトリを集約する。
		{
			provide: MikroStatsRepository,
			inject: [
				MikroAdminUserRepository,
				MikroApiKeyAdminRepository,
				MikroReportRepository,
				MikroUnfreezeRequestRepository
			],
			useFactory: (
				users: MikroAdminUserRepository,
				apiKeys: MikroApiKeyAdminRepository,
				reports: MikroReportRepository,
				unfreeze: MikroUnfreezeRequestRepository
			) => new MikroStatsRepository(users, apiKeys, reports, unfreeze)
		},
		{ provide: STATS_REPOSITORY, useExisting: MikroStatsRepository },

		// 認証・セキュリティのポート実装。
		Argon2idPasswordHasher,
		{ provide: PASSWORD_HASHER, useExisting: Argon2idPasswordHasher },
		{
			provide: ADMIN_SESSION_STORE,
			inject: [CLOCK],
			useFactory: (clock: Clock) => new InMemoryAdminSessionStore(clock)
		},
		{
			provide: WEBAUTHN_CHALLENGE_STORE,
			inject: [CLOCK],
			useFactory: (clock: Clock) => new InMemoryWebauthnChallengeStore(clock)
		},
		{ provide: WEBAUTHN_CONFIG, useFactory: () => loadEnv().adminWebauthn },
		{
			provide: WEBAUTHN_VERIFIER,
			inject: [WEBAUTHN_CONFIG],
			useFactory: (config: { rpName: string; rpId: string; origin: string }) =>
				new SimpleWebauthnVerifier(config)
		},

		// 監査記録ヘルパー。
		{
			provide: AuditRecorder,
			inject: [AUDIT_LOG_REPOSITORY, CLOCK, ID_GENERATOR],
			useFactory: (audit: AuditLogRepository, clock: Clock, ids: IdGenerator) =>
				new AuditRecorder({ audit, clock, ids })
		},

		// ユースケース(純粋クラス)を Gateway から組み立てる。
		{
			provide: AdminAuthService,
			inject: [ADMIN_ACCOUNT_REPOSITORY, PASSWORD_HASHER, ADMIN_SESSION_STORE, AuditRecorder],
			useFactory: (
				admins: AdminAccountRepository,
				passwords: PasswordHasher,
				sessions: AdminSessionStore,
				audit: AuditRecorder
			) => new AdminAuthService({ admins, passwords, sessions, audit })
		},
		{
			provide: AdminWebauthnService,
			inject: [
				ADMIN_ACCOUNT_REPOSITORY,
				ADMIN_WEBAUTHN_CREDENTIAL_REPOSITORY,
				WEBAUTHN_CHALLENGE_STORE,
				WEBAUTHN_VERIFIER,
				ADMIN_SESSION_STORE,
				AuditRecorder,
				CLOCK,
				ID_GENERATOR
			],
			useFactory: (
				admins: AdminAccountRepository,
				creds: AdminWebauthnCredentialRepository,
				challenges: WebauthnChallengeStore,
				verifier: WebauthnVerifier,
				sessions: AdminSessionStore,
				audit: AuditRecorder,
				clock: Clock,
				ids: IdGenerator
			) =>
				new AdminWebauthnService({
					admins,
					creds,
					challenges,
					verifier,
					sessions,
					audit,
					clock,
					ids
				})
		},
		{
			provide: AdminAccountService,
			inject: [ADMIN_ACCOUNT_REPOSITORY, PASSWORD_HASHER, AuditRecorder, CLOCK, ID_GENERATOR],
			useFactory: (
				admins: AdminAccountRepository,
				passwords: PasswordHasher,
				audit: AuditRecorder,
				clock: Clock,
				ids: IdGenerator
			) => new AdminAccountService({ admins, passwords, audit, clock, ids })
		},
		{
			provide: ModerationService,
			inject: [
				ADMIN_USER_REPOSITORY,
				SUSPENSION_REPOSITORY,
				UNFREEZE_REQUEST_REPOSITORY,
				REPORT_REPOSITORY,
				API_KEY_ADMIN_REPOSITORY,
				AuditRecorder,
				CLOCK,
				ID_GENERATOR
			],
			useFactory: (
				users: AdminUserRepository,
				suspensions: SuspensionRepository,
				unfreezeRequests: UnfreezeRequestRepository,
				reports: ReportRepository,
				apiKeys: ApiKeyAdminRepository,
				audit: AuditRecorder,
				clock: Clock,
				ids: IdGenerator
			) =>
				new ModerationService({
					users,
					suspensions,
					unfreezeRequests,
					reports,
					apiKeys,
					audit,
					clock,
					ids
				})
		},
		{
			provide: ApiKeyAdminService,
			inject: [API_KEY_ADMIN_REPOSITORY, SETTINGS_REPOSITORY, AuditRecorder, CLOCK],
			useFactory: (
				apiKeys: ApiKeyAdminRepository,
				settings: SettingsRepository,
				audit: AuditRecorder,
				clock: Clock
			) => new ApiKeyAdminService({ apiKeys, settings, audit, clock })
		},
		{
			provide: UserAdminService,
			inject: [ADMIN_USER_REPOSITORY],
			useFactory: (users: AdminUserRepository) => new UserAdminService({ users })
		},
		{
			provide: StatsService,
			inject: [STATS_REPOSITORY],
			useFactory: (stats: StatsRepository) => new StatsService({ stats })
		},
		{
			provide: AuditLogService,
			inject: [AUDIT_LOG_REPOSITORY],
			useFactory: (audit: AuditLogRepository) => new AuditLogService({ audit })
		},

		AdminContextProvider,
		AdminResolver
	]
})
export class AdminModule {}
