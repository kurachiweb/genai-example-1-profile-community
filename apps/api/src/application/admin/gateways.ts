// 管理者ユースケースが宣言する Gateway(データアクセス・外部依存のインターフェース)。
// 実装は Interface Adapters/Frameworks 側(MikroORM リポジトリ・PBKDF2・セッションストア・WebAuthn 検証)。
// 本番は Cloudflare D1/KV、ローカルは SQLite/インプロセスへ DI トークンで差し替える(clean-architecture)。
import { AdminRole } from '../../domain/admin-role';
import { AuditLogRecord } from '../../domain/audit-event';
import { ReportStatus, SuspensionStatus, UnfreezeRequestStatus } from '../../domain/moderation';
import { UserStatus } from '../../domain/user-status';
import {
	AdminAccountRecord,
	AdminStats,
	ApiKeyMeta,
	AuditLogQuery,
	AuditLogView,
	ReportRecord,
	SuspensionRecord,
	UnfreezeRequestRecord,
	UserListFilter,
	UserListResult,
	UserSummary
} from './models';

export const ADMIN_ACCOUNT_REPOSITORY = Symbol('AdminAccountRepository');

export interface AdminAccountRepository {
	findById(id: string): Promise<AdminAccountRecord | null>;
	findByEmailNormalized(emailNormalized: string): Promise<AdminAccountRecord | null>;
	countActiveByRole(role: AdminRole): Promise<number>;
	list(): Promise<AdminAccountRecord[]>;
	countPasskeys(adminId: string): Promise<number>;
	save(record: AdminAccountRecord): Promise<void>;
}

export const AUDIT_LOG_REPOSITORY = Symbol('AuditLogRepository');

export interface AuditLogRepository {
	/** 追記専用。更新/削除は提供しない(BR-ADMIN-010)。 */
	append(record: AuditLogRecord): Promise<void>;
	list(query: AuditLogQuery): Promise<{ logs: AuditLogView[]; total: number }>;
}

export const ADMIN_USER_REPOSITORY = Symbol('AdminUserRepository');

export interface AdminUserRepository {
	list(filter: UserListFilter): Promise<UserListResult>;
	findSummary(userId: string): Promise<UserSummary | null>;
	getStatus(userId: string): Promise<UserStatus | null>;
	setStatus(userId: string, status: UserStatus): Promise<void>;
	/** アイコンを既定に戻す(icon_image_id を null に、AC-ADMIN-005)。 */
	clearIcon(userId: string): Promise<void>;
	countByStatus(status: UserStatus): Promise<number>;
	countAll(): Promise<number>;
	countEffectivePublic(): Promise<number>;
}

export const SUSPENSION_REPOSITORY = Symbol('SuspensionRepository');

export interface SuspensionRepository {
	create(record: SuspensionRecord): Promise<void>;
	findActiveByUserId(userId: string): Promise<SuspensionRecord | null>;
	setStatus(id: string, status: SuspensionStatus, liftedAt: Date | null): Promise<void>;
}

export const UNFREEZE_REQUEST_REPOSITORY = Symbol('UnfreezeRequestRepository');

export interface UnfreezeRequestRepository {
	list(status?: UnfreezeRequestStatus): Promise<UnfreezeRequestRecord[]>;
	findById(id: string): Promise<UnfreezeRequestRecord | null>;
	setReviewed(
		id: string,
		status: UnfreezeRequestStatus,
		reviewedBy: string,
		reviewedAt: Date
	): Promise<void>;
	countByStatus(status: UnfreezeRequestStatus): Promise<number>;
}

export const REPORT_REPOSITORY = Symbol('ReportRepository');

export interface ReportRepository {
	list(status?: ReportStatus): Promise<ReportRecord[]>;
	findById(id: string): Promise<ReportRecord | null>;
	setStatus(id: string, status: ReportStatus, updatedAt: Date): Promise<void>;
	countByStatus(status: ReportStatus): Promise<number>;
}

export const API_KEY_ADMIN_REPOSITORY = Symbol('ApiKeyAdminRepository');

export interface ApiKeyAdminRepository {
	listMeta(): Promise<ApiKeyMeta[]>;
	findMetaById(id: string): Promise<ApiKeyMeta | null>;
	revoke(id: string, revokedAt: Date): Promise<void>;
	revokeAllForUser(userId: string, revokedAt: Date): Promise<void>;
	countActive(): Promise<number>;
}

export const SETTINGS_REPOSITORY = Symbol('SettingsRepository');

export interface SettingsRepository {
	/** 公開 API 共通レート制限(リクエスト/分)。未設定なら既定値を返す。 */
	getApiRateLimitPerMinute(): Promise<number>;
	setApiRateLimitPerMinute(value: number): Promise<void>;
}

export const STATS_REPOSITORY = Symbol('StatsRepository');

export interface StatsRepository {
	collect(): Promise<AdminStats>;
}

// --- 認証・セキュリティのポート ---

export const PASSWORD_HASHER = Symbol('PasswordHasher');

export interface PasswordHasher {
	hash(plain: string): Promise<string>;
	verify(hash: string, plain: string): Promise<boolean>;
}

// PBKDF2 のイテレーション数上限(100,000、password-hasher.ts 参照)を補うためのペッパー。
// DB とは独立した Cloudflare Workers Secrets(env.PASSWORD_PEPPER)から供給する。
export const PASSWORD_PEPPER = Symbol('PasswordPepper');

export const ADMIN_SESSION_STORE = Symbol('AdminSessionStore');

export interface AdminSession {
	readonly sessionId: string;
	readonly adminId: string;
	readonly csrfToken: string;
	readonly createdAt: Date;
	readonly lastAccessAt: Date;
}

export interface AdminSessionStore {
	/** セッションを発行する(有効 8h・アイドル 30 分は実装側で TTL 管理、BR-COMMON-002)。 */
	create(adminId: string): Promise<AdminSession>;
	/** セッションを検証しスライディング更新する。失効なら null。 */
	resolve(sessionId: string): Promise<AdminSession | null>;
	destroy(sessionId: string): Promise<void>;
}

// --- WebAuthn(パスキー) ---

export interface AdminWebauthnCredentialRecord {
	readonly id: string;
	readonly adminAccountId: string;
	readonly credentialId: string;
	readonly publicKey: string;
	readonly signCount: number;
	readonly transports: string | null;
	readonly aaguid: string | null;
	readonly nickname: string | null;
	readonly lastUsedAt: Date | null;
	readonly createdAt: Date;
}

export const ADMIN_WEBAUTHN_CREDENTIAL_REPOSITORY = Symbol('AdminWebauthnCredentialRepository');

export interface AdminWebauthnCredentialRepository {
	listByAdmin(adminAccountId: string): Promise<AdminWebauthnCredentialRecord[]>;
	findByCredentialId(credentialId: string): Promise<AdminWebauthnCredentialRecord | null>;
	save(record: AdminWebauthnCredentialRecord): Promise<void>;
	updateSignCount(id: string, signCount: number, lastUsedAt: Date): Promise<void>;
	delete(id: string, adminAccountId: string): Promise<void>;
}

export const WEBAUTHN_CHALLENGE_STORE = Symbol('WebauthnChallengeStore');

export interface WebauthnChallengeStore {
	/** チャレンジを短命・ワンタイムで保存する(KV、db §7)。 */
	put(key: string, challenge: string): Promise<void>;
	/** 取り出して即時破棄する(ワンタイム)。未存在/期限切れは null。 */
	take(key: string): Promise<string | null>;
}

export const WEBAUTHN_VERIFIER = Symbol('WebauthnVerifier');

export interface WebauthnRegistrationOptions {
	readonly challenge: string;
	readonly optionsJson: Record<string, unknown>;
}

export interface WebauthnVerifiedRegistration {
	readonly credentialId: string;
	readonly publicKey: string;
	readonly signCount: number;
	readonly transports: string | null;
	readonly aaguid: string | null;
}

export interface WebauthnAuthenticationOptions {
	readonly challenge: string;
	readonly optionsJson: Record<string, unknown>;
}

export interface WebauthnVerifiedAuthentication {
	readonly newSignCount: number;
}

/** WebAuthn の暗号検証は @simplewebauthn/server に委譲する(車輪の再発明をしない、clean-architecture)。 */
export interface WebauthnVerifier {
	generateRegistrationOptions(input: {
		adminId: string;
		adminEmail: string;
		existingCredentialIds: readonly string[];
	}): Promise<WebauthnRegistrationOptions>;
	verifyRegistration(input: {
		responseJson: Record<string, unknown>;
		expectedChallenge: string;
	}): Promise<WebauthnVerifiedRegistration>;
	generateAuthenticationOptions(input: {
		allowCredentialIds: readonly string[];
	}): Promise<WebauthnAuthenticationOptions>;
	verifyAuthentication(input: {
		responseJson: Record<string, unknown>;
		expectedChallenge: string;
		credentialPublicKey: string;
		credentialId: string;
		currentSignCount: number;
	}): Promise<WebauthnVerifiedAuthentication>;
}
