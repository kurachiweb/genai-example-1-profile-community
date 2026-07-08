// 公開プロフィール機能モジュール(coding/04-nestjs.md §1)。Gateway 実装・ユースケース・コントローラ・
// 横断ガードを束ねる。DI トークンで Gateway(IF)と実装を結びつけ、ユースケースは実装に依存しない。
import { Module } from '@nestjs/common';
import { ThrottlerStorage, ThrottlerStorageService } from '@nestjs/throttler';
import {
	API_KEY_REPOSITORY,
	CLOCK,
	ID_GENERATOR,
	PROFILE_REPOSITORY,
	SETTINGS_REPOSITORY,
	SNS_LINK_REPOSITORY,
	USER_REPOSITORY,
	type ApiKeyRepository,
	type Clock,
	type IdGenerator,
	type ProfileRepository,
	type SnsLinkRepository,
	type UserRepository
} from '../../application/gateways';
import { PublicProfileService } from '../../application/public-profile.service';
import { loadEnv } from '../../config/env';
import { SystemClock } from '../../infrastructure/clock';
import { UlidGenerator } from '../../infrastructure/id-generator';
import { MikroApiKeyRepository } from '../../infrastructure/persistence/api-key.repository';
import { MikroProfileRepository } from '../../infrastructure/persistence/profile.repository';
import { MikroSettingsRepository } from '../../infrastructure/persistence/settings.repository';
import { MikroSnsLinkRepository } from '../../infrastructure/persistence/sns-link.repository';
import { MikroUserRepository } from '../../infrastructure/persistence/user.repository';
import { DurableObjectThrottlerStorage } from '../../infrastructure/rate-limit/durable-object-throttler-storage';
import { getRateLimiterNamespace } from '../../infrastructure/workers-runtime';
import { MeProfileController } from './me-profile.controller';
import { ProfilesController } from './profiles.controller';
import { ApiKeyThrottlerGuard, RATE_LIMIT_OPTIONS } from './guards/api-key-throttler.guard';
import { ApiKeyAuthGuard } from './guards/api-key.guard';
import { ApiScopeGuard } from './guards/scope.guard';

@Module({
	controllers: [MeProfileController, ProfilesController],
	providers: [
		// Gateway 実装(Interface Adapters)。
		MikroUserRepository,
		MikroApiKeyRepository,
		MikroProfileRepository,
		MikroSnsLinkRepository,
		MikroSettingsRepository,
		SystemClock,
		UlidGenerator,
		// Gateway(IF)トークン → 実装の束ね。
		{ provide: USER_REPOSITORY, useExisting: MikroUserRepository },
		{ provide: API_KEY_REPOSITORY, useExisting: MikroApiKeyRepository },
		{ provide: PROFILE_REPOSITORY, useExisting: MikroProfileRepository },
		{ provide: SNS_LINK_REPOSITORY, useExisting: MikroSnsLinkRepository },
		{ provide: SETTINGS_REPOSITORY, useExisting: MikroSettingsRepository },
		{ provide: CLOCK, useExisting: SystemClock },
		{ provide: ID_GENERATOR, useExisting: UlidGenerator },
		// 時間窓は env を正本とする(BR-API-008)。上限回数は管理画面が app_settings に書き込む値を
		// ガードが毎リクエスト参照するため、ここは未設定時のフォールバック既定値(BR-ADMIN-008)。
		{
			provide: RATE_LIMIT_OPTIONS,
			useFactory: () => {
				const env = loadEnv();
				return { windowSeconds: env.rateLimitWindowSeconds, limit: env.rateLimitPerWindow };
			}
		},
		// Cloudflare Workers(worker.ts)ではDOバインディングが登録されるため、キー単位で
		// 厳密にカウントするDOバックエンドへ切り替える。ローカル/dev(main.ts)・テストでは
		// 未登録のため、@nestjs/throttler既定のメモリストレージにフォールバックする(ADR 20260604)。
		{
			provide: ThrottlerStorage,
			useFactory: () => {
				const namespace = getRateLimiterNamespace();
				return namespace
					? new DurableObjectThrottlerStorage(namespace)
					: new ThrottlerStorageService();
			}
		},
		// ユースケース(純粋クラス)を Gateway から組み立てる。
		{
			provide: PublicProfileService,
			inject: [
				USER_REPOSITORY,
				API_KEY_REPOSITORY,
				PROFILE_REPOSITORY,
				SNS_LINK_REPOSITORY,
				CLOCK,
				ID_GENERATOR
			],
			useFactory: (
				users: UserRepository,
				apiKeys: ApiKeyRepository,
				profiles: ProfileRepository,
				snsLinks: SnsLinkRepository,
				clock: Clock,
				ids: IdGenerator
			) => new PublicProfileService({ users, apiKeys, profiles, snsLinks, clock, ids })
		},
		// 横断ガード(@UseGuards でコントローラに適用)。
		ApiKeyAuthGuard,
		ApiKeyThrottlerGuard,
		ApiScopeGuard
	]
})
export class ProfileModule {}
