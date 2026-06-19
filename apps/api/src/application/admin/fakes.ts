// 管理者ユースケースのテスト用インメモリ・フェイク(決定論的、外部 I/O を Gateway 境界で差し替える)。
// 本番ロジックではないためカバレッジ対象外(jest.config.js 参照)。
import { AdminRole } from '../../domain/admin-role';
import { AuditLogRecord } from '../../domain/audit-event';
import { ReportStatus, SuspensionStatus, UnfreezeRequestStatus } from '../../domain/moderation';
import { UserStatus } from '../../domain/user-status';
import { Clock, IdGenerator } from '../gateways';
import {
	AdminAccountRepository,
	AdminSession,
	AdminSessionStore,
	AdminWebauthnCredentialRecord,
	AdminWebauthnCredentialRepository,
	ApiKeyAdminRepository,
	AdminUserRepository,
	AuditLogRepository,
	PasswordHasher,
	ReportRepository,
	SettingsRepository,
	StatsRepository,
	SuspensionRepository,
	UnfreezeRequestRepository,
	WebauthnChallengeStore
} from './gateways';
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

export class FakeClock implements Clock {
	constructor(private current: Date = new Date('2026-06-19T00:00:00Z')) {}
	now(): Date {
		return this.current;
	}
	advance(ms: number): void {
		this.current = new Date(this.current.getTime() + ms);
	}
}

export class FakeIdGenerator implements IdGenerator {
	private counter = 0;
	constructor(private readonly prefix = 'id') {}
	ulid(): string {
		this.counter += 1;
		return `${this.prefix}-${String(this.counter).padStart(4, '0')}`;
	}
}

/** プレーン値を「hash:<plain>」として扱う単純なフェイク(Argon2id の代替、決定論的)。 */
export class FakePasswordHasher implements PasswordHasher {
	async hash(plain: string): Promise<string> {
		return `hash:${plain}`;
	}
	async verify(hash: string, plain: string): Promise<boolean> {
		return hash === `hash:${plain}`;
	}
}

export class InMemoryAdminAccountRepository implements AdminAccountRepository {
	private readonly byId = new Map<string, AdminAccountRecord>();
	private readonly passkeyCounts = new Map<string, number>();

	constructor(records: readonly AdminAccountRecord[] = []) {
		for (const record of records) {
			this.byId.set(record.id, record);
		}
	}
	setPasskeyCount(adminId: string, count: number): void {
		this.passkeyCounts.set(adminId, count);
	}
	async findById(id: string): Promise<AdminAccountRecord | null> {
		return this.byId.get(id) ?? null;
	}
	async findByEmailNormalized(email: string): Promise<AdminAccountRecord | null> {
		for (const record of this.byId.values()) {
			if (record.email.toLowerCase() === email) {
				return record;
			}
		}
		return null;
	}
	async countActiveByRole(role: AdminRole): Promise<number> {
		let count = 0;
		for (const record of this.byId.values()) {
			if (record.role === role && record.status === 'active') {
				count += 1;
			}
		}
		return count;
	}
	async list(): Promise<AdminAccountRecord[]> {
		return [...this.byId.values()];
	}
	async countPasskeys(adminId: string): Promise<number> {
		return this.passkeyCounts.get(adminId) ?? 0;
	}
	async save(record: AdminAccountRecord): Promise<void> {
		this.byId.set(record.id, record);
	}
}

export class InMemoryAuditLogRepository implements AuditLogRepository {
	readonly records: AuditLogRecord[] = [];
	async append(record: AuditLogRecord): Promise<void> {
		this.records.push(record);
	}
	async list(query: AuditLogQuery): Promise<{ logs: AuditLogView[]; total: number }> {
		let filtered = this.records.filter((record) => {
			if (query.actorType && record.actorType !== query.actorType) return false;
			if (query.eventType && record.eventType !== query.eventType) return false;
			if (query.targetId && record.targetId !== query.targetId) return false;
			return true;
		});
		filtered = filtered.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
		const total = filtered.length;
		const logs = filtered.slice(query.offset, query.offset + query.limit);
		return { logs, total };
	}
}

export class InMemoryAdminSessionStore implements AdminSessionStore {
	private readonly sessions = new Map<string, AdminSession>();
	private counter = 0;
	constructor(private readonly clock: Clock) {}
	async create(adminId: string): Promise<AdminSession> {
		this.counter += 1;
		const now = this.clock.now();
		const session: AdminSession = {
			sessionId: `sess-${this.counter}`,
			adminId,
			csrfToken: `csrf-${this.counter}`,
			createdAt: now,
			lastAccessAt: now
		};
		this.sessions.set(session.sessionId, session);
		return session;
	}
	async resolve(sessionId: string): Promise<AdminSession | null> {
		return this.sessions.get(sessionId) ?? null;
	}
	async destroy(sessionId: string): Promise<void> {
		this.sessions.delete(sessionId);
	}
}

export class InMemoryAdminUserRepository implements AdminUserRepository {
	constructor(private users: UserSummary[] = []) {}
	private readonly statuses = new Map<string, UserStatus>();
	async list(filter: UserListFilter): Promise<UserListResult> {
		let filtered = this.users;
		if (filter.status) {
			filtered = filtered.filter((u) => u.status === filter.status);
		}
		if (filter.search) {
			const q = filter.search.toLowerCase();
			filtered = filtered.filter(
				(u) => u.email.toLowerCase().includes(q) || (u.handle ?? '').toLowerCase().includes(q)
			);
		}
		const total = filtered.length;
		return { users: filtered.slice(filter.offset, filter.offset + filter.limit), total };
	}
	async findSummary(userId: string): Promise<UserSummary | null> {
		return this.users.find((u) => u.id === userId) ?? null;
	}
	async getStatus(userId: string): Promise<UserStatus | null> {
		const override = this.statuses.get(userId);
		if (override) return override;
		return this.users.find((u) => u.id === userId)?.status ?? null;
	}
	async setStatus(userId: string, status: UserStatus): Promise<void> {
		this.statuses.set(userId, status);
		this.users = this.users.map((u) => (u.id === userId ? { ...u, status } : u));
	}
	clearedIcons: string[] = [];
	async clearIcon(userId: string): Promise<void> {
		this.clearedIcons.push(userId);
	}
	async countByStatus(status: UserStatus): Promise<number> {
		return this.users.filter((u) => u.status === status).length;
	}
	async countAll(): Promise<number> {
		return this.users.length;
	}
	async countEffectivePublic(): Promise<number> {
		return this.users.filter((u) => u.status === 'ACTIVE' && u.visibility === 'public').length;
	}
}

export class InMemorySuspensionRepository implements SuspensionRepository {
	readonly records: SuspensionRecord[] = [];
	async create(record: SuspensionRecord): Promise<void> {
		this.records.push(record);
	}
	async findActiveByUserId(userId: string): Promise<SuspensionRecord | null> {
		return this.records.find((r) => r.userId === userId && r.status === 'active') ?? null;
	}
	async setStatus(id: string, status: SuspensionStatus, liftedAt: Date | null): Promise<void> {
		const index = this.records.findIndex((r) => r.id === id);
		if (index >= 0) {
			this.records[index] = { ...this.records[index], status, liftedAt };
		}
	}
}

export class InMemoryUnfreezeRequestRepository implements UnfreezeRequestRepository {
	constructor(private records: UnfreezeRequestRecord[] = []) {}
	async list(status?: UnfreezeRequestStatus): Promise<UnfreezeRequestRecord[]> {
		return status ? this.records.filter((r) => r.status === status) : [...this.records];
	}
	async findById(id: string): Promise<UnfreezeRequestRecord | null> {
		return this.records.find((r) => r.id === id) ?? null;
	}
	async setReviewed(
		id: string,
		status: UnfreezeRequestStatus,
		reviewedBy: string,
		reviewedAt: Date
	): Promise<void> {
		this.records = this.records.map((r) =>
			r.id === id ? { ...r, status, reviewedBy, reviewedAt } : r
		);
	}
	async countByStatus(status: UnfreezeRequestStatus): Promise<number> {
		return this.records.filter((r) => r.status === status).length;
	}
}

export class InMemoryReportRepository implements ReportRepository {
	constructor(private records: ReportRecord[] = []) {}
	async list(status?: ReportStatus): Promise<ReportRecord[]> {
		return status ? this.records.filter((r) => r.status === status) : [...this.records];
	}
	async findById(id: string): Promise<ReportRecord | null> {
		return this.records.find((r) => r.id === id) ?? null;
	}
	async setStatus(id: string, status: ReportStatus, updatedAt: Date): Promise<void> {
		this.records = this.records.map((r) => (r.id === id ? { ...r, status, updatedAt } : r));
	}
	async countByStatus(status: ReportStatus): Promise<number> {
		return this.records.filter((r) => r.status === status).length;
	}
}

export class InMemoryApiKeyAdminRepository implements ApiKeyAdminRepository {
	constructor(private records: ApiKeyMeta[] = []) {}
	async listMeta(): Promise<ApiKeyMeta[]> {
		return [...this.records];
	}
	async findMetaById(id: string): Promise<ApiKeyMeta | null> {
		return this.records.find((r) => r.id === id) ?? null;
	}
	async revoke(id: string, revokedAt: Date): Promise<void> {
		this.records = this.records.map((r) =>
			r.id === id ? { ...r, status: 'revoked', revokedAt } : r
		);
	}
	async revokeAllForUser(userId: string, revokedAt: Date): Promise<void> {
		this.records = this.records.map((r) =>
			r.userId === userId ? { ...r, status: 'revoked', revokedAt } : r
		);
	}
	async countActive(): Promise<number> {
		return this.records.filter((r) => r.status === 'active').length;
	}
}

export class InMemorySettingsRepository implements SettingsRepository {
	constructor(private rateLimit: number | null = null) {}
	async getApiRateLimitPerMinute(): Promise<number> {
		return this.rateLimit ?? 60;
	}
	async setApiRateLimitPerMinute(value: number): Promise<void> {
		this.rateLimit = value;
	}
}

export class FakeStatsRepository implements StatsRepository {
	constructor(private readonly stats: AdminStats) {}
	async collect(): Promise<AdminStats> {
		return this.stats;
	}
}

export class InMemoryWebauthnChallengeStore implements WebauthnChallengeStore {
	private readonly store = new Map<string, string>();
	async put(key: string, challenge: string): Promise<void> {
		this.store.set(key, challenge);
	}
	async take(key: string): Promise<string | null> {
		const value = this.store.get(key) ?? null;
		this.store.delete(key);
		return value;
	}
}

/** 決定論的な WebAuthn 検証フェイク。実際の暗号検証は行わず、responseJson の目印で成否を制御する。 */
export class FakeWebauthnVerifier {
	async generateRegistrationOptions(input: {
		adminId: string;
		adminEmail: string;
		existingCredentialIds: readonly string[];
	}): Promise<{ challenge: string; optionsJson: Record<string, unknown> }> {
		const challenge = `chal-reg-${input.adminId}`;
		return { challenge, optionsJson: { challenge, rp: { id: 'localhost' } } };
	}
	async verifyRegistration(input: {
		responseJson: Record<string, unknown>;
		expectedChallenge: string;
	}): Promise<{
		credentialId: string;
		publicKey: string;
		signCount: number;
		transports: string | null;
		aaguid: string | null;
	}> {
		if (input.responseJson.fail) {
			throw new Error('registration verification failed');
		}
		return {
			credentialId: String(input.responseJson.id ?? 'cred-1'),
			publicKey: 'cose-public-key',
			signCount: 0,
			transports: null,
			aaguid: null
		};
	}
	async generateAuthenticationOptions(input: {
		allowCredentialIds: readonly string[];
	}): Promise<{ challenge: string; optionsJson: Record<string, unknown> }> {
		return { challenge: 'chal-auth', optionsJson: { allowCredentials: input.allowCredentialIds } };
	}
	async verifyAuthentication(input: {
		responseJson: Record<string, unknown>;
		expectedChallenge: string;
		credentialPublicKey: string;
		credentialId: string;
		currentSignCount: number;
	}): Promise<{ newSignCount: number }> {
		if (input.responseJson.fail) {
			throw new Error('authentication verification failed');
		}
		return { newSignCount: input.currentSignCount + 1 };
	}
}

export class InMemoryAdminWebauthnCredentialRepository implements AdminWebauthnCredentialRepository {
	constructor(private records: AdminWebauthnCredentialRecord[] = []) {}
	async listByAdmin(adminAccountId: string): Promise<AdminWebauthnCredentialRecord[]> {
		return this.records.filter((r) => r.adminAccountId === adminAccountId);
	}
	async findByCredentialId(credentialId: string): Promise<AdminWebauthnCredentialRecord | null> {
		return this.records.find((r) => r.credentialId === credentialId) ?? null;
	}
	async save(record: AdminWebauthnCredentialRecord): Promise<void> {
		this.records = [...this.records.filter((r) => r.id !== record.id), record];
	}
	async updateSignCount(id: string, signCount: number, lastUsedAt: Date): Promise<void> {
		this.records = this.records.map((r) => (r.id === id ? { ...r, signCount, lastUsedAt } : r));
	}
	async delete(id: string, adminAccountId: string): Promise<void> {
		this.records = this.records.filter(
			(r) => !(r.id === id && r.adminAccountId === adminAccountId)
		);
	}
}
