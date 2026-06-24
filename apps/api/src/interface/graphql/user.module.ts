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
import {
	EmailVerificationTokenStore,
	InMemoryTokenStore,
	UserApiKeyRepository,
	UserService
} from '../../application/user.service';
import { SystemClock } from '../../infrastructure/clock';
import { UlidGenerator } from '../../infrastructure/id-generator';
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
				USER_TOKEN_STORE
			],
			useFactory: (
				users: UserRepository,
				sessions: InMemoryUserSessionStore,
				passwordHasher: PasswordHasher,
				clock: Clock,
				ids: IdGenerator,
				apiKeys: UserApiKeyRepository,
				tokenStore: EmailVerificationTokenStore
			) => new UserService({ users, sessions, passwordHasher, clock, ids, apiKeys, tokenStore })
		},
		ViewerProvider,
		UserResolver
	],
	exports: [ViewerProvider, USER_SESSION_STORE, UserService]
})
export class UserModule {}
