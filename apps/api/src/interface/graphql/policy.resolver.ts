// 規約・プライバシーポリシーの公開閲覧リゾルバ(BR-CONTENT-010)。ログイン不要・薄く保つ。
import { Args, Query, Resolver } from '@nestjs/graphql';
import { PolicyType as PolicyTypeEnum } from '../../domain/content';
import { PublicPolicyService } from '../../application/policy.service';
import { PolicyRecord } from '../../application/admin/content-models';
import { PolicyType, PublicPolicyArgs, PublicPolicyVersionArgs } from './types/policy.type';

function present(record: PolicyRecord): PolicyType {
	return {
		type: record.type,
		version: record.version,
		bodyMarkdown: record.bodyMarkdown,
		isPublished: record.isPublished,
		requiresReconsent: record.requiresReconsent,
		effectiveDate: record.effectiveDate
	};
}

@Resolver()
export class PolicyResolver {
	constructor(private readonly policies: PublicPolicyService) {}

	/** 発効中(公開中)の版を取得する。未発行なら null(client 側で notFound() を呼ぶ)。 */
	@Query(() => PolicyType, { name: 'publicPolicy', nullable: true })
	async publicPolicy(@Args() args: PublicPolicyArgs): Promise<PolicyType | null> {
		const record = await this.policies.getPublished(args.type as PolicyTypeEnum);
		return record ? present(record) : null;
	}

	/** 過去版を含む全版を版番号の降順で取得する(BR-CONTENT-010: 過去版も参照可能)。 */
	@Query(() => [PolicyType], { name: 'publicPolicyVersions' })
	async publicPolicyVersions(@Args() args: PublicPolicyArgs): Promise<PolicyType[]> {
		const records = await this.policies.listVersions(args.type as PolicyTypeEnum);
		return records.map(present);
	}

	/** 版番号を指定して特定の版(過去版含む)を取得する。存在しなければ null。 */
	@Query(() => PolicyType, { name: 'publicPolicyVersion', nullable: true })
	async publicPolicyVersion(@Args() args: PublicPolicyVersionArgs): Promise<PolicyType | null> {
		const record = await this.policies.getVersion(args.type as PolicyTypeEnum, args.version);
		return record ? present(record) : null;
	}
}
