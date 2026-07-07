// 規約・プライバシーポリシーの公開閲覧ユースケース(BR-CONTENT-010)。
// 認可・ログイン不要。編集/発効は application/admin/policy.service.ts(PolicyService, super_admin 限定)が担う。
import { PolicyType } from '../domain/content';
import { PolicyRepository } from './admin/content-gateways';
import { PolicyRecord } from './admin/content-models';

export interface PublicPolicyServiceDeps {
	readonly policies: PolicyRepository;
}

export class PublicPolicyService {
	constructor(private readonly deps: PublicPolicyServiceDeps) {}

	/** 発効中(公開中)の版を取得する。存在しなければ null(client 側で 404 相当を表示)。 */
	async getPublished(type: PolicyType): Promise<PolicyRecord | null> {
		const versions = await this.deps.policies.listByType(type);
		return versions.find((v) => v.isPublished) ?? null;
	}

	/** 過去版を含む全版を版番号の降順で取得する(BR-CONTENT-010: 過去版も参照可能)。 */
	async listVersions(type: PolicyType): Promise<PolicyRecord[]> {
		return this.deps.policies.listByType(type);
	}

	/** 版番号を指定して特定の版(過去版含む)を取得する。存在しなければ null。 */
	async getVersion(type: PolicyType, version: number): Promise<PolicyRecord | null> {
		const versions = await this.deps.policies.listByType(type);
		return versions.find((v) => v.version === version) ?? null;
	}
}
