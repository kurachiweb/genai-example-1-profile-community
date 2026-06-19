// 管理者認証(メール＋パスワード)とセッションのユースケース(BR-COMMON-002/003・security/01)。
// 失敗メッセージは識別子を漏らさず統一する(BR-COMMON-012)。ログイン成否は監査に記録する(BR-COMMON-013)。
import { AdminAccountStatus } from '../../domain/admin-account';
import { AuditActorType, AuditEventType, AuditResult } from '../../domain/audit-event';
import { normalizeEmail } from '../../domain/admin-credentials';
import { UnauthorizedError } from '../../domain/errors';
import { AuditRecorder } from './audit-recorder';
import {
	AdminAccountRepository,
	AdminSession,
	AdminSessionStore,
	PasswordHasher
} from './gateways';
import { AdminPrincipal } from './models';

export interface AdminAuthServiceDeps {
	readonly admins: AdminAccountRepository;
	readonly passwords: PasswordHasher;
	readonly sessions: AdminSessionStore;
	readonly audit: AuditRecorder;
}

export interface LoginInput {
	readonly email: string;
	readonly password: string;
}

export interface LoginResult {
	readonly session: AdminSession;
	readonly principal: AdminPrincipal;
}

const GENERIC_LOGIN_FAILURE = 'メールアドレスかパスワードが正しくありません。';

export class AdminAuthService {
	constructor(private readonly deps: AdminAuthServiceDeps) {}

	async login(input: LoginInput): Promise<LoginResult> {
		const email = normalizeEmail(input.email);
		const admin = await this.deps.admins.findByEmailNormalized(email);
		const passwordOk =
			admin !== null && (await this.deps.passwords.verify(admin.passwordHash, input.password));
		const allowed = admin !== null && admin.status === AdminAccountStatus.ACTIVE && passwordOk;

		if (!admin || !allowed) {
			await this.deps.audit.record({
				eventType: AuditEventType.ADMIN_LOGIN_FAILED,
				actorType: AuditActorType.ADMIN,
				actorId: admin?.id ?? null,
				result: AuditResult.FAILURE,
				metadata: { email }
			});
			// 列挙防止のため統一文面(BR-COMMON-012)。
			throw new UnauthorizedError(GENERIC_LOGIN_FAILURE);
		}

		const session = await this.deps.sessions.create(admin.id);
		await this.deps.audit.record({
			eventType: AuditEventType.ADMIN_LOGIN,
			actorType: AuditActorType.ADMIN,
			actorId: admin.id,
			result: AuditResult.SUCCESS
		});
		return { session, principal: { adminId: admin.id, role: admin.role } };
	}

	async logout(sessionId: string, actorId: string | null): Promise<void> {
		await this.deps.sessions.destroy(sessionId);
		await this.deps.audit.record({
			eventType: AuditEventType.ADMIN_LOGOUT,
			actorType: AuditActorType.ADMIN,
			actorId
		});
	}

	/** セッション ID から操作主体を解決する。無効・無効化済みアカウントは null(認証なし扱い)。 */
	async resolvePrincipal(
		sessionId: string | undefined
	): Promise<{ principal: AdminPrincipal; session: AdminSession } | null> {
		if (!sessionId) {
			return null;
		}
		const session = await this.deps.sessions.resolve(sessionId);
		if (!session) {
			return null;
		}
		const admin = await this.deps.admins.findById(session.adminId);
		if (!admin || admin.status !== AdminAccountStatus.ACTIVE) {
			return null;
		}
		return { principal: { adminId: admin.id, role: admin.role }, session };
	}
}
