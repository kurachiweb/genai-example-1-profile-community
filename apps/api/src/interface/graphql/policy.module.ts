// 規約・プライバシーポリシーの公開閲覧モジュール(BR-CONTENT-010)。永続化 Gateway は admin 側の
// content-gateways/content.repositories(POLICY_REPOSITORY)を再利用する(規約データの保存先は単一)。
import { Module } from '@nestjs/common';
import { POLICY_REPOSITORY, PolicyRepository } from '../../application/admin/content-gateways';
import { MikroPolicyRepository } from '../../infrastructure/persistence/content.repositories';
import { PublicPolicyService } from '../../application/policy.service';
import { PolicyResolver } from './policy.resolver';

@Module({
	providers: [
		MikroPolicyRepository,
		{ provide: POLICY_REPOSITORY, useExisting: MikroPolicyRepository },
		{
			provide: PublicPolicyService,
			inject: [POLICY_REPOSITORY],
			useFactory: (policies: PolicyRepository) => new PublicPolicyService({ policies })
		},
		PolicyResolver
	]
})
export class PolicyModule {}
