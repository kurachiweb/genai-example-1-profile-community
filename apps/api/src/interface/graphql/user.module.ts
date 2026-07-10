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
import { PasswordHasher, PASSWORD_PEPPER } from '../../application/admin/gateways';
import { MAIL_SENDER, MailSender } from '../../application/admin/content-gateways';
import {
	EmailVerificationTokenStore,
	UserApiKeyRepository,
	UserService
} from '../../application/user.service';
import { loadEnv } from '../../config/env';
import { SystemClock } from '../../infrastructure/clock';
import { UlidGenerator } from '../../infrastructure/id-generator';
import { ValkeyEmailVerificationTokenStore } from '../../infrastructure/email-verification-token.store';
import { NodemailerMailSender } from '../../infrastructure/mail-sender';
import { SesMailSender } from '../../infrastructure/ses-mail-sender';
import { Pbkdf2PasswordHasher } from '../../infrastructure/password-hasher';
import { MikroUserRepository } from '../../infrastructure/persistence/user.repository';
import { MikroUserApiKeyRepository } from '../../infrastructure/persistence/api-key-user.repository';
import { createValkeyClient, ValkeyClient } from '../../infrastructure/valkey-client';
import { createKVValkeyClient } from '../../infrastructure/kv-valkey-client';
import {
	getAppKV,
	getSessionClientKV,
	isWorkersRuntime
} from '../../infrastructure/workers-runtime';
import {
	USER_SESSION_STORE,
	UserSessionStore,
	ValkeyUserSessionStore
} from '../../infrastructure/user-session.store';
import { ViewerProvider } from './viewer.provider';
import { UserResolver } from './user.resolver';

export const USER_PASSWORD_HASHER = Symbol('UserPasswordHasher');
export const USER_TOKEN_STORE = Symbol('UserTokenStore');
export const USER_API_KEY_REPO = Symbol('UserApiKeyRepo');
// admin.module.ts の MAIL_CONFIG と同型(モジュール間でプロバイダを共有しない既存方針に倣う)。
const MAIL_CONFIG = Symbol('UserMailConfig');
// admin.module.ts の Valkey クライアントとは別接続にする(モジュール間でプロバイダを共有しない既存方針)。
// 本番(Workers)ではセッションとトークンで異なる KV 名前空間を使うため、ローカル(Valkey)でも
// 用途ごとに接続を分ける(db §7、01-network-architecture.md §4)。
const USER_SESSION_VALKEY_CLIENT = Symbol('UserSessionValkeyClient');
const USER_TOKEN_VALKEY_CLIENT = Symbol('UserTokenValkeyClient');

@Module({
	providers: [
		// インフラ実装。
		MikroUserRepository,
		MikroUserApiKeyRepository,
		SystemClock,
		UlidGenerator,
		Pbkdf2PasswordHasher,
		// PBKDF2 のイテレーション数上限(100,000)を補うペッパー(password-hasher.ts §HMAC事前処理)。
		{ provide: PASSWORD_PEPPER, useFactory: () => loadEnv().passwordPepper },
		// DI トークン結線。
		{ provide: USER_REPOSITORY, useExisting: MikroUserRepository },
		{ provide: CLOCK, useExisting: SystemClock },
		{ provide: ID_GENERATOR, useExisting: UlidGenerator },
		{ provide: USER_PASSWORD_HASHER, useExisting: Pbkdf2PasswordHasher },
		{ provide: USER_API_KEY_REPO, useExisting: MikroUserApiKeyRepository },
		// Valkey/KV 接続(ユーザーセッション・メール確認トークンの保存先。本番は Cloudflare KV、db §7)。
		// 本番(Workers)では workers-runtime に登録された KV バインディングを使い、
		// ローカル/dev(main.ts)では未登録のため Valkey へフォールバックする。
		{
			provide: USER_SESSION_VALKEY_CLIENT,
			useFactory: (): ValkeyClient => {
				const kv = getSessionClientKV();
				return kv ? createKVValkeyClient(kv) : createValkeyClient(loadEnv().valkeyUrl);
			}
		},
		{
			provide: USER_TOKEN_VALKEY_CLIENT,
			useFactory: (): ValkeyClient => {
				const kv = getAppKV();
				return kv ? createKVValkeyClient(kv) : createValkeyClient(loadEnv().valkeyUrl);
			}
		},
		{
			provide: USER_SESSION_STORE,
			inject: [USER_SESSION_VALKEY_CLIENT],
			useFactory: (client: ValkeyClient) => new ValkeyUserSessionStore(client)
		},
		{
			provide: USER_TOKEN_STORE,
			inject: [USER_TOKEN_VALKEY_CLIENT],
			useFactory: (client: ValkeyClient) => new ValkeyEmailVerificationTokenStore(client)
		},
		// メール送信(ローカル/dev(main.ts)は Mailpit、本番/dev(Workers)は SES。
		// admin.module.ts と同型の独立プロバイダ)。
		{
			provide: MAIL_CONFIG,
			useFactory: () => ({
				// ローカルは docker compose のサービス名(compose.yaml)。
				host: process.env.MAIL_SMTP_HOST || 'mailpit',
				// `??` は空文字列を救わず Number('') === 0 になるため `||` で未設定/空の両方をデフォルトへ落とす。
				port: Number(process.env.MAIL_SMTP_PORT || 1025),
				from: process.env.MAIL_FROM || 'GenAI Profile Community <no-reply@example.com>'
			})
		},
		{
			provide: MAIL_SENDER,
			inject: [MAIL_CONFIG],
			// isWorkersRuntime() は D1 バインディング登録有無で判定する(mikro-orm.config.ts と同じ signal、
			// workers-runtime.ts)。Workers は生 SMTP ソケットを扱えないため、本番/dev は SES(fetch 経由)を使う。
			useFactory: (config: { host: string; port: number; from: string }): MailSender =>
				isWorkersRuntime()
					? new SesMailSender({
							from: config.from,
							region: process.env.AWS_DEFAULT_REGION ?? '',
							accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID ?? '',
							secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY ?? ''
						})
					: new NodemailerMailSender(config)
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
				sessions: UserSessionStore,
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
