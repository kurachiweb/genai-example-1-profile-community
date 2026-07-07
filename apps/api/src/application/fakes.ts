// ユーザーユースケースのテスト用インメモリ・フェイク(決定論的、外部 I/O を Gateway 境界で差し替える)。
// 本番ロジックではないためカバレッジ対象外(jest.config.ts 参照)。admin/fakes.ts と同型の方針。
import type { Clock } from './gateways';
import type { UserSession, UserSessionStore } from '../infrastructure/user-session.store';
import type { EmailVerificationTokenStore } from './user.service';

export class InMemoryUserSessionStore implements UserSessionStore {
	private readonly sessions = new Map<
		string,
		{ userId: string; createdAt: Date; lastAccessAt: Date }
	>();

	constructor(private readonly clock: Clock) {}

	async create(userId: string): Promise<UserSession> {
		const now = this.clock.now();
		const sessionId = `sess-${this.sessions.size + 1}`;
		this.sessions.set(sessionId, { userId, createdAt: now, lastAccessAt: now });
		return { sessionId, userId };
	}

	async resolve(sessionId: string): Promise<UserSession | null> {
		const stored = this.sessions.get(sessionId);
		if (!stored) return null;
		stored.lastAccessAt = this.clock.now();
		return { sessionId, userId: stored.userId };
	}

	async destroy(sessionId: string): Promise<void> {
		this.sessions.delete(sessionId);
	}
}

export class InMemoryTokenStore implements EmailVerificationTokenStore {
	private readonly tokens = new Map<string, { userId: string; type: string; extra?: string }>();
	private counter = 0;

	async create(
		userId: string,
		type: 'verify' | 'reset' | 'change_email',
		extra?: string
	): Promise<string> {
		this.counter += 1;
		const token = `token-${this.counter}`;
		this.tokens.set(token, { userId, type, extra });
		return token;
	}

	async consume(
		token: string,
		type: 'verify' | 'reset' | 'change_email'
	): Promise<{ userId: string; extra?: string } | null> {
		const stored = this.tokens.get(token);
		this.tokens.delete(token);
		if (!stored || stored.type !== type) return null;
		return { userId: stored.userId, extra: stored.extra };
	}
}
