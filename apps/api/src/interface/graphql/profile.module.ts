// Profile 機能モジュール。Gateway 実装・ユースケース・リゾルバを束ねる(coding/04-nestjs.md §1)。
// DI トークンで Gateway(IF)と実装を結びつけ、ユースケースは実装に依存しない(依存性逆転)。
import { Module } from '@nestjs/common';
import {
	CLOCK,
	Clock,
	ID_GENERATOR,
	IdGenerator,
	PROFILE_REPOSITORY,
	ProfileRepository,
	SNS_LINK_REPOSITORY,
	SnsLinkRepository,
	USER_REPOSITORY,
	UserRepository
} from '../../application/gateways';
import { ProfileService } from '../../application/profile.service';
import { SystemClock } from '../../infrastructure/clock';
import { UlidGenerator } from '../../infrastructure/id-generator';
import { MikroProfileRepository } from '../../infrastructure/persistence/profile.repository';
import { MikroSnsLinkRepository } from '../../infrastructure/persistence/sns-link.repository';
import { MikroUserRepository } from '../../infrastructure/persistence/user.repository';
import { ProfileResolver } from './profile.resolver';
import { ViewerProvider } from './viewer.provider';

@Module({
	providers: [
		// Gateway 実装(Interface Adapters)。
		MikroUserRepository,
		MikroProfileRepository,
		MikroSnsLinkRepository,
		SystemClock,
		UlidGenerator,
		// Gateway(IF)トークン → 実装の束ね。
		{ provide: USER_REPOSITORY, useExisting: MikroUserRepository },
		{ provide: PROFILE_REPOSITORY, useExisting: MikroProfileRepository },
		{ provide: SNS_LINK_REPOSITORY, useExisting: MikroSnsLinkRepository },
		{ provide: CLOCK, useExisting: SystemClock },
		{ provide: ID_GENERATOR, useExisting: UlidGenerator },
		// ユースケース(純粋クラス)を Gateway から組み立てる。
		{
			provide: ProfileService,
			inject: [USER_REPOSITORY, PROFILE_REPOSITORY, SNS_LINK_REPOSITORY, CLOCK, ID_GENERATOR],
			useFactory: (
				users: UserRepository,
				profiles: ProfileRepository,
				snsLinks: SnsLinkRepository,
				clock: Clock,
				ids: IdGenerator
			) => new ProfileService({ users, profiles, snsLinks, clock, ids })
		},
		ViewerProvider,
		ProfileResolver
	],
	exports: [ProfileService]
})
export class ProfileModule {}
