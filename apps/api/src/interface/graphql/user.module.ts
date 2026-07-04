// ユーザー機能モジュール。認証・アカウント管理・API キーの Gateway・ユースケース・リゾルバを束ねる。
import { Module } from '@nestjs/common';
import {
	CLOCK,
	Clock,
	ID_GENERATOR,
	IdGenerator,
	USER_REPOSITORY,
	UserRepository
} from '../../application/gateways';
import { PasswordHasher } from '../../application/admin/gateways';
import { MAIL_SENDER, MailSender } from '../../application/admin/content-gateways';
import {
	EmailVerificationTokenStore,
	InMemoryTokenStore,
	UserApiKeyRepository,
	UserService
} from '../../application/user.service';
import { loadEnv } from '../../config/env';
import { SystemClock } from '../../infrastructure/clock';
import { UlidGenerator } from '../../infrastructure/id-generator';
import { NodemailerMailSender } from '../../infrastructure/mail-sender';
import { Argon2idPasswordHasher } from '../../infrastructure/password-hasher';
import { MikroUserRepository } from '../../infrastructure/persistence/user.repository';
import { MikroUserApiKeyRepository } from '../../infrastructure/persistence/api-key-user.repository';
import {
	InMemoryUserSessionStore,
	USER_SESSION_STORE
} from '../../infrastructure/user-session.store';
import { ViewerProvider } from './viewer.provider';
import { UserResolver } from './user.resolver';

export const USER_PASSWORD_HASHER = Symbol('UserPasswordHasher');
export const USER_TOKEN_STORE = Symbol('UserTokenStore');
export const USER_API_KEY_REPO = Symbol('UserApiKeyRepo');
// admin.module.ts の MAIL_CONFIG と同型(モジュール間でプロバイダを共有しない既存方針に倣う)。
const MAIL_CONFIG = Symbol('UserMailConfig');

@Module({
	providers: [
		// インフラ実装。
		MikroUserRepository,
		MikroUserApiKeyRepository,
		SystemClock,
		UlidGenerator,
		Argon2idPasswordHasher,
		InMemoryTokenStore,
		// DI トークン結線。
		{ provide: USER_REPOSITORY, useExisting: MikroUserRepository },
		{ provide: CLOCK, useExisting: SystemClock },
		{ provide: ID_GENERATOR, useExisting: UlidGenerator },
		{ provide: USER_PASSWORD_HASHER, useExisting: Argon2idPasswordHasher },
		{ provide: USER_TOKEN_STORE, useExisting: InMemoryTokenStore },
		{ provide: USER_API_KEY_REPO, useExisting: MikroUserApiKeyRepository },
		// ユーザーセッションストア(インプロセス KV 相当)。Clock 注入が必要。
		{
			provide: USER_SESSION_STORE,
			inject: [CLOCK],
			useFactory: (clock: Clock) => new InMemoryUserSessionStore(clock)
		},
		// メール送信(ローカルは Mailpit、本番は SES へ差し替え。admin.module.ts と同型の独立プロバイダ)。
		{
			provide: MAIL_CONFIG,
			useFactory: () => ({
				host: process.env.MAIL_SMTP_HOST || 'localhost',
				// `??` は空文字列を救わず Number('') === 0 になるため `||` で未設定/空の両方をデフォルトへ落とす。
				port: Number(process.env.MAIL_SMTP_PORT || 1025),
				from: process.env.MAIL_FROM || 'GenAI Profile Community <no-reply@example.com>'
			})
		},
		{
			provide: MAIL_SENDER,
			inject: [MAIL_CONFIG],
			useFactory: (config: { host: string; port: number; from: string }) =>
				new NodemailerMailSender(config)
		},
		// ユースケース。
		{
			provide: UserService,
			inject: [
				USER_REPOSITORY,
				USER_SESSION_STORE,
				USER_PASSWORD_HASHER,
				CLOCK,
				ID_GENERATOR,
				USER_API_KEY_REPO,
				USER_TOKEN_STORE,
				MAIL_SENDER
			],
			useFactory: (
				users: UserRepository,
				sessions: InMemoryUserSessionStore,
				passwordHasher: PasswordHasher,
				clock: Clock,
				ids: IdGenerator,
				apiKeys: UserApiKeyRepository,
				tokenStore: EmailVerificationTokenStore,
				mail: MailSender
			) =>
				new UserService({
					users,
					sessions,
					passwordHasher,
					clock,
					ids,
					apiKeys,
					tokenStore,
					mail,
					clientOrigin: loadEnv().clientOrigin
				})
		},
		ViewerProvider,
		UserResolver
	],
	exports: [ViewerProvider, USER_SESSION_STORE, UserService]
})
export class UserModule {}
