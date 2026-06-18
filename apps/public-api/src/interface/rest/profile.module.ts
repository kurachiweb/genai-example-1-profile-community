// 公開プロフィール機能モジュール(coding/04-nestjs.md §1)。Gateway 実装・ユースケース・コントローラ・
// 横断ガードを束ねる。DI トークンで Gateway(IF)と実装を結びつけ、ユースケースは実装に依存しない。
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import {
	API_KEY_REPOSITORY,
	CLOCK,
	ID_GENERATOR,
	PROFILE_REPOSITORY,
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
import { MikroSnsLinkRepository } from '../../infrastructure/persistence/sns-link.repository';
import { MikroUserRepository } from '../../infrastructure/persistence/user.repository';
import { MeProfileController } from './me-profile.controller';
import { ProfilesController } from './profiles.controller';
import { ApiKeyThrottlerGuard, RATE_LIMIT_OPTIONS } from './guards/api-key-throttler.guard';
import { ApiKeyAuthGuard } from './guards/api-key.guard';
import { ApiScopeGuard } from './guards/scope.guard';

@Module({
	// ThrottlerModule は既定のメモリストレージ(ThrottlerStorage)を提供する。
	// しきい値はカスタムガードが RATE_LIMIT_OPTIONS(env)から渡すため、ここの値は安全網の既定。
	imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }])],
	controllers: [MeProfileController, ProfilesController],
	providers: [
		// Gateway 実装(Interface Adapters)。
		MikroUserRepository,
		MikroApiKeyRepository,
		MikroProfileRepository,
		MikroSnsLinkRepository,
		SystemClock,
		UlidGenerator,
		// Gateway(IF)トークン → 実装の束ね。
		{ provide: USER_REPOSITORY, useExisting: MikroUserRepository },
		{ provide: API_KEY_REPOSITORY, useExisting: MikroApiKeyRepository },
		{ provide: PROFILE_REPOSITORY, useExisting: MikroProfileRepository },
		{ provide: SNS_LINK_REPOSITORY, useExisting: MikroSnsLinkRepository },
		{ provide: CLOCK, useExisting: SystemClock },
		{ provide: ID_GENERATOR, useExisting: UlidGenerator },
		// レート制限のしきい値・時間窓は env を正本とする(BR-API-008/BR-ADMIN-008)。
		{
			provide: RATE_LIMIT_OPTIONS,
			useFactory: () => {
				const env = loadEnv();
				return { windowSeconds: env.rateLimitWindowSeconds, limit: env.rateLimitPerWindow };
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
