// ユーザー認証・アカウント管理のユースケース(Interactor)。フレームワーク非依存の純粋オーケストレーション。
// ビジネスルール(BR-ACCT-*)に基づくバリデーション・状態遷移・セッション管理を担う。
import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ForbiddenError, UnauthorizedError, ValidationError } from '../domain/errors';
import { UserStatus } from '../domain/user-status';
import {
	Clock,
	IdGenerator,
	ProfileCreateInput,
	UserCreateInput,
	UserRepository
} from './gateways';
import { UserRecord } from './models';
import { UserSession, UserSessionStore } from '../infrastructure/user-session.store';
import { PasswordHasher } from './admin/gateways';

/** API キーのスコープ。 */
export type ApiKeyScope = 'read' | 'full';

export interface ApiKeyRecord {
	readonly id: string;
	readonly userId: string;
	readonly label: string | null;
	readonly scope: ApiKeyScope;
	readonly status: string;
	readonly lastUsedAt: Date | null;
	readonly createdAt: Date;
	readonly revokedAt: Date | null;
}

export interface CreatedApiKey extends ApiKeyRecord {
	readonly rawKey: string;
}

export interface UserApiKeyRepository {
	findActiveByUserId(userId: string): Promise<ApiKeyRecord[]>;
	create(record: ApiKeyRecord & { keyHash: string }): Promise<void>;
	revoke(id: string, userId: string, revokedAt: Date): Promise<void>;
}

export interface EmailVerificationTokenStore {
	create(
		userId: string,
		type: 'verify' | 'reset' | 'change_email',
		extra?: string
	): Promise<string>;
	consume(
		token: string,
		type: 'verify' | 'reset' | 'change_email'
	): Promise<{ userId: string; extra?: string } | null>;
}

export interface UserServiceDeps {
	readonly users: UserRepository;
	readonly sessions: UserSessionStore;
	readonly passwordHasher: PasswordHasher;
	readonly clock: Clock;
	readonly ids: IdGenerator;
	readonly apiKeys: UserApiKeyRepository;
	readonly tokenStore: EmailVerificationTokenStore;
}

const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_MAX_LENGTH = 128;

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function validatePasswordPolicy(password: string, email: string): void {
	if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
		throw new ValidationError(
			`パスワードは ${PASSWORD_MIN_LENGTH}〜${PASSWORD_MAX_LENGTH} 文字で設定してください。`,
			[
				{
					field: 'password',
					message: `${PASSWORD_MIN_LENGTH}〜${PASSWORD_MAX_LENGTH} 文字で設定してください。`
				}
			]
		);
	}
	const emailLocal = normalizeEmail(email).split('@')[0];
	if (password.toLowerCase() === emailLocal) {
		throw new ValidationError('メールアドレスと同じパスワードは使用できません。', [
			{ field: 'password', message: 'メールアドレスと同じパスワードは使用できません。' }
		]);
	}
}

/** ULID を小文字化してハンドルに使用する(26 文字・有効な形式)。 */
function ulidToHandle(ulid: string): string {
	return ulid.toLowerCase();
}

export class UserService {
	constructor(private readonly deps: UserServiceDeps) {}

	// --- 認証 ---

	/**
	 * 新規ユーザーを登録する(BR-ACCT-001/002/003)。
	 * 既登録メールでも同一の完了レスポンスを返す(列挙防止)。
	 */
	async register(email: string, password: string): Promise<void> {
		const emailNorm = normalizeEmail(email);
		validatePasswordPolicy(password, email);

		const existing = await this.deps.users.findByEmailNormalized(emailNorm);
		if (existing) {
			// 登録済みの場合は案内メールを送るが UI 側には同一完了を返す(BR-ACCT-001)。
			// TODO: 登録済み通知メール送信
			return;
		}

		const userId = this.deps.ids.ulid();
		const profileId = this.deps.ids.ulid();
		const handle = ulidToHandle(profileId);
		const passwordHash = await this.deps.passwordHasher.hash(password);

		const userInput: UserCreateInput = {
			id: userId,
			email,
			emailNormalized: emailNorm,
			passwordHash,
			status: UserStatus.UNVERIFIED
		};
		const profileInput: ProfileCreateInput = { id: profileId, userId, handle };

		await this.deps.users.createWithProfile(userInput, profileInput);

		// メール確認トークンを発行して送信する。
		const token = await this.deps.tokenStore.create(userId, 'verify');
		// TODO: 確認メール送信(token を含む URL)
		void token;
	}

	/** メール＋パスワードでログインし、セッションを返す(BR-ACCT-004)。 */
	async login(email: string, password: string): Promise<UserSession> {
		const emailNorm = normalizeEmail(email);
		const user = await this.deps.users.findByEmailNormalized(emailNorm);
		const FAIL = new UnauthorizedError('メールアドレスかパスワードが正しくありません。');

		// ユーザーが存在しない場合もハッシュ検証相当の処理をする(タイミング攻撃防止)。
		const dummyHash = '$argon2id$v=19$m=19456,t=2,p=1$dummysalt$dummyhash';
		const hash = user ? ((await this.deps.users.getPasswordHash(user.id)) ?? dummyHash) : dummyHash;
		const valid = await this.deps.passwordHasher.verify(hash, password);
		if (!user || !valid) throw FAIL;

		if (user.status === UserStatus.WITHDRAWN) throw FAIL;

		return this.deps.sessions.create(user.id);
	}

	/** セッションを破棄する(BR-ACCT-004)。 */
	async logout(sessionId: string): Promise<void> {
		await this.deps.sessions.destroy(sessionId);
	}

	/** メールアドレスを確認する(BR-ACCT-003)。 */
	async verifyEmail(token: string): Promise<void> {
		const result = await this.deps.tokenStore.consume(token, 'verify');
		if (!result) {
			throw new ValidationError('確認リンクが無効か期限切れです。');
		}
		await this.deps.users.update(result.userId, {
			status: UserStatus.ACTIVE,
			emailVerifiedAt: this.deps.clock.now()
		});
	}

	/** パスワードリセット用トークンをメール送信する(BR-ACCT-006)。 */
	async requestPasswordReset(email: string): Promise<void> {
		const emailNorm = normalizeEmail(email);
		const user = await this.deps.users.findByEmailNormalized(emailNorm);
		if (!user || user.status === UserStatus.WITHDRAWN) {
			// 存在有無を問わず同一の完了を返す(列挙防止、BR-ACCT-006)。
			return;
		}
		const token = await this.deps.tokenStore.create(user.id, 'reset');
		// TODO: リセットメール送信
		void token;
	}

	/** パスワードをリセットする(BR-ACCT-006)。 */
	async resetPassword(token: string, newPassword: string): Promise<void> {
		const result = await this.deps.tokenStore.consume(token, 'reset');
		if (!result) {
			throw new ValidationError('リンクが無効か期限切れです。');
		}
		const user = await this.deps.users.findById(result.userId);
		if (!user) throw new ValidationError('アカウントが見つかりません。');
		validatePasswordPolicy(newPassword, user.email);
		const hash = await this.deps.passwordHasher.hash(newPassword);
		// セッションエポックを更新し、既存セッションを全失効させる(BR-ACCT-006)。
		await this.deps.users.update(result.userId, { passwordHash: hash, sessionEpoch: Date.now() });
	}

	/** 確認メールを再送する(BR-ACCT-003)。 */
	async resendVerificationEmail(userId: string): Promise<void> {
		const user = await this.deps.users.findById(userId);
		if (!user || user.emailVerifiedAt) return;
		const token = await this.deps.tokenStore.create(userId, 'verify');
		// TODO: 確認メール送信
		void token;
	}

	// --- アカウント管理 ---

	/** 現在のユーザー情報を返す。 */
	async getMe(userId: string): Promise<UserRecord> {
		const user = await this.deps.users.findById(userId);
		if (!user) throw new UnauthorizedError();
		return user;
	}

	/** パスワードを変更する(BR-ACCT-005)。 */
	async changePassword(
		userId: string,
		currentPassword: string,
		newPassword: string
	): Promise<void> {
		const user = await this.deps.users.findById(userId);
		if (!user) throw new UnauthorizedError();

		const hash = await this.deps.users.getPasswordHash(userId);
		if (!hash || !(await this.deps.passwordHasher.verify(hash, currentPassword))) {
			throw new ValidationError('現在のパスワードが正しくありません。', [
				{ field: 'currentPassword', message: '現在のパスワードが正しくありません。' }
			]);
		}
		validatePasswordPolicy(newPassword, user.email);
		const newHash = await this.deps.passwordHasher.hash(newPassword);
		// 当該セッション以外を全失効(BR-ACCT-005)。
		await this.deps.users.update(userId, { passwordHash: newHash, sessionEpoch: Date.now() });
		// TODO: パスワード変更通知メール
	}

	/** メールアドレス変更リクエストを行う(BR-ACCT-007)。 */
	async requestEmailChange(userId: string, newEmail: string, password: string): Promise<void> {
		const user = await this.deps.users.findById(userId);
		if (!user) throw new UnauthorizedError();

		const hash = await this.deps.users.getPasswordHash(userId);
		if (!hash || !(await this.deps.passwordHasher.verify(hash, password))) {
			throw new ValidationError('パスワードが正しくありません。', [
				{ field: 'password', message: 'パスワードが正しくありません。' }
			]);
		}
		const emailNorm = normalizeEmail(newEmail);
		const existing = await this.deps.users.findByEmailNormalized(emailNorm);
		if (existing && existing.id !== userId) {
			// 存在有無を漏らさないため一律完了を返す(BR-ACCT-001)。
			return;
		}
		const token = await this.deps.tokenStore.create(userId, 'change_email', emailNorm);
		// TODO: 確認メール送信
		void token;
	}

	/** 退会する(BR-ACCT-009)。 */
	async withdraw(userId: string, password: string): Promise<void> {
		const user = await this.deps.users.findById(userId);
		if (!user) throw new UnauthorizedError();

		if (user.status === UserStatus.FROZEN) {
			throw new ForbiddenError(
				'凍結中のアカウントは退会できません。解除リクエスト後に再度お試しください。'
			);
		}
		const hash = await this.deps.users.getPasswordHash(userId);
		if (!hash || !(await this.deps.passwordHasher.verify(hash, password))) {
			throw new ValidationError('パスワードが正しくありません。', [
				{ field: 'password', message: 'パスワードが正しくありません。' }
			]);
		}
		// 退会: 状態を WITHDRAWN に変更(匿名化は将来の定期バッチで行う)。
		await this.deps.users.update(userId, {
			status: UserStatus.WITHDRAWN,
			sessionEpoch: Date.now()
		});
	}

	// --- API キー ---

	async listApiKeys(userId: string): Promise<ApiKeyRecord[]> {
		return this.deps.apiKeys.findActiveByUserId(userId);
	}

	async createApiKey(userId: string, label: string, scope: ApiKeyScope): Promise<CreatedApiKey> {
		// 生キーはランダムな 32 バイト(base64url)。ハッシュのみ保存する(BR-API-001)。
		const rawKey = randomBytes(32).toString('base64url');
		const keyHash = createHash('sha256').update(rawKey).digest('hex');

		const record: ApiKeyRecord & { keyHash: string } = {
			id: this.deps.ids.ulid(),
			userId,
			label: label.trim() || null,
			scope,
			status: 'active',
			lastUsedAt: null,
			createdAt: this.deps.clock.now(),
			revokedAt: null,
			keyHash
		};
		await this.deps.apiKeys.create(record);
		return { ...record, rawKey };
	}

	async revokeApiKey(userId: string, keyId: string): Promise<void> {
		await this.deps.apiKeys.revoke(keyId, userId, this.deps.clock.now());
	}
}

/** インメモリ実装のメール確認トークンストア(本番は Cloudflare KV)。 */
@Injectable()
export class InMemoryTokenStore implements EmailVerificationTokenStore {
	private readonly tokens = new Map<
		string,
		{ userId: string; type: string; extra?: string; expiresAt: Date }
	>();

	async create(userId: string, type: string, extra?: string): Promise<string> {
		const token = randomBytes(32).toString('base64url');
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 時間
		this.tokens.set(token, { userId, type, extra, expiresAt });
		return token;
	}

	async consume(token: string, type: string): Promise<{ userId: string; extra?: string } | null> {
		const stored = this.tokens.get(token);
		if (!stored || stored.type !== type || stored.expiresAt < new Date()) {
			this.tokens.delete(token);
			return null;
		}
		this.tokens.delete(token);
		return { userId: stored.userId, extra: stored.extra };
	}
}
