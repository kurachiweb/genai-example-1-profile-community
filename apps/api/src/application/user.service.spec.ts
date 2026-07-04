import { NameDisplayOrder } from '../domain/display-name';
import { Visibility } from '../domain/effective-public';
import { UnauthorizedError, ValidationError } from '../domain/errors';
import { UserStatus } from '../domain/user-status';
import {
	Clock,
	IdGenerator,
	ProfileCreateInput,
	UserCreateInput,
	UserRepository,
	UserUpdateInput
} from './gateways';
import { ProfileRecord, UserRecord } from './models';
import {
	ApiKeyRecord,
	CreatedApiKey,
	InMemoryTokenStore,
	UserApiKeyRepository,
	UserService
} from './user.service';
import { InMemoryUserSessionStore } from '../infrastructure/user-session.store';
import { MailMessage, MailSender } from './admin/content-gateways';

// --- フェイク実装 ---

class FakeUserRepository implements UserRepository {
	readonly users = new Map<
		string,
		UserRecord & { passwordHash: string; emailNormalized: string }
	>();
	readonly profiles = new Map<string, ProfileRecord>();

	async findById(id: string): Promise<UserRecord | null> {
		const u = this.users.get(id);
		return u
			? { id: u.id, email: u.email, status: u.status, emailVerifiedAt: u.emailVerifiedAt }
			: null;
	}
	async findByEmailNormalized(emailNormalized: string): Promise<UserRecord | null> {
		const u = [...this.users.values()].find((u) => u.emailNormalized === emailNormalized);
		return u
			? { id: u.id, email: u.email, status: u.status, emailVerifiedAt: u.emailVerifiedAt }
			: null;
	}
	async getPasswordHash(userId: string): Promise<string | null> {
		return this.users.get(userId)?.passwordHash ?? null;
	}
	async createWithProfile(user: UserCreateInput, profile: ProfileCreateInput): Promise<void> {
		this.users.set(user.id, {
			id: user.id,
			email: user.email,
			emailNormalized: user.emailNormalized,
			passwordHash: user.passwordHash,
			status: user.status,
			emailVerifiedAt: null
		});
		// ProfileEntity の既定値(visibility=public, nameDisplayOrder=given_first)を MikroUserRepository と揃える。
		this.profiles.set(profile.id, {
			id: profile.id,
			userId: profile.userId,
			handle: profile.handle,
			visibility: Visibility.PUBLIC,
			iconImageId: null,
			firstName: '',
			lastName: '',
			nameDisplayOrder: NameDisplayOrder.GIVEN_FIRST,
			occupation: null,
			searchName: null,
			bio: null,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}
	async update(userId: string, changes: UserUpdateInput): Promise<void> {
		const u = this.users.get(userId);
		if (!u) return;
		this.users.set(userId, {
			...u,
			...(changes.status !== undefined && { status: changes.status }),
			...(changes.emailVerifiedAt !== undefined && { emailVerifiedAt: changes.emailVerifiedAt }),
			...(changes.passwordHash !== undefined && { passwordHash: changes.passwordHash })
		});
	}
}

class FakePasswordHasher {
	async hash(plain: string): Promise<string> {
		return `hashed:${plain}`;
	}
	async verify(hash: string, plain: string): Promise<boolean> {
		return hash === `hashed:${plain}`;
	}
}

class FakeApiKeyRepo implements UserApiKeyRepository {
	readonly keys: (ApiKeyRecord & { keyHash: string })[] = [];
	async findActiveByUserId(userId: string): Promise<ApiKeyRecord[]> {
		return this.keys.filter((k) => k.userId === userId && k.status === 'active');
	}
	async create(record: ApiKeyRecord & { keyHash: string }): Promise<void> {
		this.keys.push(record);
	}
	async revoke(id: string, userId: string, revokedAt: Date): Promise<void> {
		const index = this.keys.findIndex((k) => k.id === id && k.userId === userId);
		if (index !== -1) {
			this.keys[index] = { ...this.keys[index], status: 'revoked', revokedAt };
		}
	}
}

class FixedClock implements Clock {
	now(): Date {
		return new Date('2026-06-15T00:00:00.000Z');
	}
}

class SeqIdGenerator implements IdGenerator {
	private n = 0;
	ulid(): string {
		this.n += 1;
		return `01J${this.n.toString().padStart(23, '0')}`;
	}
}

class FakeMailSender implements MailSender {
	readonly sent: MailMessage[] = [];
	async send(message: MailMessage): Promise<void> {
		this.sent.push(message);
	}
}

class ThrowingMailSender implements MailSender {
	async send(): Promise<void> {
		throw new Error('SMTP接続に失敗しました(テスト用)');
	}
}

const CLIENT_ORIGIN = 'http://localhost:48032';

/** メール本文に埋め込まれた確認トークンを取り出す(実際に発行されたトークンとの一致を検証するため)。 */
function extractVerifyToken(html: string): string {
	const match = /verify-email\?token=([^"&<\s]+)/.exec(html);
	if (!match) throw new Error('確認リンクがメール本文に見つからない');
	return match[1];
}

// --- ハーネス ---

interface Harness {
	service: UserService;
	users: FakeUserRepository;
	sessions: InMemoryUserSessionStore;
	apiKeys: FakeApiKeyRepo;
	tokenStore: InMemoryTokenStore;
	mail: FakeMailSender;
}

function makeHarness(): Harness {
	const users = new FakeUserRepository();
	const clock = new FixedClock();
	const sessions = new InMemoryUserSessionStore(clock);
	const apiKeys = new FakeApiKeyRepo();
	const tokenStore = new InMemoryTokenStore();
	const mail = new FakeMailSender();
	const service = new UserService({
		users,
		sessions,
		passwordHasher: new FakePasswordHasher(),
		clock,
		ids: new SeqIdGenerator(),
		apiKeys,
		tokenStore,
		mail,
		clientOrigin: CLIENT_ORIGIN
	});
	return { service, users, sessions, apiKeys, tokenStore, mail };
}

// --- テスト ---

describe('UserService.register', () => {
	it('新規ユーザーを登録し User レコードを作成する', async () => {
		const h = makeHarness();
		await h.service.register('user@example.com', 'password1234');
		const user = await h.users.findByEmailNormalized('user@example.com');
		expect(user).not.toBeNull();
		expect(user?.status).toBe(UserStatus.UNVERIFIED);
	});

	it('パスワードが短すぎる場合は ValidationError を投げる', async () => {
		const h = makeHarness();
		await expect(h.service.register('user@example.com', 'short')).rejects.toBeInstanceOf(
			ValidationError
		);
	});

	it('登録済みメールでも同一完了を返す(列挙防止)', async () => {
		const h = makeHarness();
		await h.service.register('user@example.com', 'password1234');
		// 2 回目も例外を投げずに返る。
		await expect(h.service.register('user@example.com', 'password1234')).resolves.toBeUndefined();
	});

	it('ユーザーと同時に紐づくプロフィールを作成する', async () => {
		const h = makeHarness();
		await h.service.register('user@example.com', 'password1234');
		const user = await h.users.findByEmailNormalized('user@example.com');
		const profile = [...h.users.profiles.values()].find((p) => p.userId === user!.id);
		expect(profile).toBeDefined();
		expect(profile?.userId).toBe(user!.id);
	});

	it('プロフィールのハンドルは profileId を小文字化した値になる', async () => {
		const h = makeHarness();
		await h.service.register('user@example.com', 'password1234');
		const user = await h.users.findByEmailNormalized('user@example.com');
		const profile = [...h.users.profiles.values()].find((p) => p.userId === user!.id);
		expect(profile?.handle).toBe(profile?.id.toLowerCase());
	});

	it('プロフィールは公開・氏名表示順=given_first の既定値で作成される(ProfileEntity の既定値と一致)', async () => {
		const h = makeHarness();
		await h.service.register('user@example.com', 'password1234');
		const user = await h.users.findByEmailNormalized('user@example.com');
		const profile = [...h.users.profiles.values()].find((p) => p.userId === user!.id);
		expect(profile?.visibility).toBe(Visibility.PUBLIC);
		expect(profile?.nameDisplayOrder).toBe(NameDisplayOrder.GIVEN_FIRST);
	});

	it('登録済みメールで再登録しても重複プロフィールは作成されない(列挙防止)', async () => {
		const h = makeHarness();
		await h.service.register('user@example.com', 'password1234');
		await h.service.register('user@example.com', 'password1234');
		expect(h.users.profiles.size).toBe(1);
	});

	it('新規登録で確認メールが送信される(BR-ACCT-003)', async () => {
		const h = makeHarness();
		await h.service.register('user@example.com', 'password1234');
		expect(h.mail.sent).toHaveLength(1);
		expect(h.mail.sent[0].to).toBe('user@example.com');
		expect(h.mail.sent[0].html).toContain(`${CLIENT_ORIGIN}/verify-email?token=`);
	});

	it('登録済みメールでの再登録では確認メールではなく登録済み案内メールが送られる(BR-ACCT-001)', async () => {
		const h = makeHarness();
		await h.service.register('user@example.com', 'password1234');
		await h.service.register('user@example.com', 'password1234');

		expect(h.mail.sent).toHaveLength(2);
		const notice = h.mail.sent[1];
		expect(notice.to).toBe('user@example.com');
		expect(notice.html).not.toContain('/verify-email?token=');
	});

	it('確認メールに埋め込まれたトークンで実際にメール確認が完了する(AC-ACCT-004)', async () => {
		const h = makeHarness();
		await h.service.register('user@example.com', 'password1234');
		const user = await h.users.findByEmailNormalized('user@example.com');

		const token = extractVerifyToken(h.mail.sent[0].html);
		await h.service.verifyEmail(token);

		const updated = await h.users.findById(user!.id);
		expect(updated?.status).toBe(UserStatus.ACTIVE);
	});

	it('メール送信が失敗した場合は例外が呼び出し元に伝播する(握りつぶさない)', async () => {
		const users = new FakeUserRepository();
		const clock = new FixedClock();
		const service = new UserService({
			users,
			sessions: new InMemoryUserSessionStore(clock),
			passwordHasher: new FakePasswordHasher(),
			clock,
			ids: new SeqIdGenerator(),
			apiKeys: new FakeApiKeyRepo(),
			tokenStore: new InMemoryTokenStore(),
			mail: new ThrowingMailSender(),
			clientOrigin: CLIENT_ORIGIN
		});

		await expect(service.register('user@example.com', 'password1234')).rejects.toThrow(
			'SMTP接続に失敗しました(テスト用)'
		);
	});
});

describe('UserService.login', () => {
	async function seedUser(h: Harness): Promise<string> {
		await h.service.register('user@example.com', 'correctpassword');
		const user = await h.users.findByEmailNormalized('user@example.com');
		return user!.id;
	}

	it('正しい認証情報でセッションを返す', async () => {
		const h = makeHarness();
		await seedUser(h);
		const session = await h.service.login('user@example.com', 'correctpassword');
		expect(session.sessionId).toBeTruthy();
	});

	it('パスワード誤りは UnauthorizedError', async () => {
		const h = makeHarness();
		await seedUser(h);
		await expect(h.service.login('user@example.com', 'wrongpassword')).rejects.toBeInstanceOf(
			UnauthorizedError
		);
	});

	it('存在しないメールでも UnauthorizedError', async () => {
		const h = makeHarness();
		await expect(h.service.login('nobody@example.com', 'anypassword')).rejects.toBeInstanceOf(
			UnauthorizedError
		);
	});
});

describe('UserService.verifyEmail', () => {
	it('有効なトークンでメール確認が完了する', async () => {
		const h = makeHarness();
		await h.service.register('user@example.com', 'password1234');
		const user = await h.users.findByEmailNormalized('user@example.com');

		// トークンをストアから直接取得する(テスト用の回避路)。
		const token = await h.tokenStore.create(user!.id, 'verify');
		await h.service.verifyEmail(token);

		const updated = await h.users.findById(user!.id);
		expect(updated?.status).toBe(UserStatus.ACTIVE);
		expect(updated).toMatchObject({ status: UserStatus.ACTIVE });
	});

	it('無効なトークンは ValidationError', async () => {
		const h = makeHarness();
		await expect(h.service.verifyEmail('invalidtoken')).rejects.toBeInstanceOf(ValidationError);
	});
});

describe('UserService.resendVerificationEmail', () => {
	it('未確認ユーザーには確認メールが再送される(BR-ACCT-003)', async () => {
		const h = makeHarness();
		await h.service.register('user@example.com', 'password1234');
		const user = await h.users.findByEmailNormalized('user@example.com');

		await h.service.resendVerificationEmail(user!.id);

		expect(h.mail.sent).toHaveLength(2);
		expect(h.mail.sent[1].to).toBe('user@example.com');
		expect(h.mail.sent[1].html).toContain(`${CLIENT_ORIGIN}/verify-email?token=`);
	});

	it('確認済みユーザーには送信しない', async () => {
		const h = makeHarness();
		await h.service.register('user@example.com', 'password1234');
		const user = await h.users.findByEmailNormalized('user@example.com');
		await h.users.update(user!.id, { status: UserStatus.ACTIVE, emailVerifiedAt: new Date() });

		await h.service.resendVerificationEmail(user!.id);

		expect(h.mail.sent).toHaveLength(1);
	});

	it('存在しない userId では何も送信しない', async () => {
		const h = makeHarness();
		await h.service.resendVerificationEmail('nonexistent-user-id');
		expect(h.mail.sent).toHaveLength(0);
	});
});

describe('UserService API キー', () => {
	async function seedActiveUser(h: Harness): Promise<string> {
		await h.service.register('user@example.com', 'password1234');
		const user = await h.users.findByEmailNormalized('user@example.com');
		await h.users.update(user!.id, { status: UserStatus.ACTIVE, emailVerifiedAt: new Date() });
		return user!.id;
	}

	it('API キーを発行して一覧に反映される', async () => {
		const h = makeHarness();
		const userId = await seedActiveUser(h);
		const created: CreatedApiKey = await h.service.createApiKey(userId, 'My Key', 'read');
		expect(created.rawKey).toBeTruthy();
		const keys = await h.service.listApiKeys(userId);
		expect(keys).toHaveLength(1);
		expect(keys[0].label).toBe('My Key');
	});

	it('失効させたキーは一覧から消える', async () => {
		const h = makeHarness();
		const userId = await seedActiveUser(h);
		const created = await h.service.createApiKey(userId, 'Key', 'read');
		await h.service.revokeApiKey(userId, created.id);
		const keys = await h.service.listApiKeys(userId);
		expect(keys).toHaveLength(0);
	});
});
