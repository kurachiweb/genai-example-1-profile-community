// 規約・プライバシーポリシーの公開閲覧ユースケース(BR-CONTENT-010)のテスト。認可不要・ログイン不要。
import { PolicyType } from '../domain/content';
import { InMemoryPolicyRepository } from './admin/content-fakes';
import { PolicyRecord } from './admin/content-models';
import { PublicPolicyService } from './policy.service';

function record(overrides: Partial<PolicyRecord>): PolicyRecord {
	return {
		id: 'po-1',
		type: PolicyType.TERMS,
		version: 1,
		bodyMarkdown: '# 利用規約',
		isPublished: false,
		requiresReconsent: false,
		effectiveDate: new Date('2026-07-01T00:00:00Z'),
		editedBy: 'admin-1',
		createdAt: new Date('2026-06-01T00:00:00Z'),
		...overrides
	};
}

describe('PublicPolicyService', () => {
	test('発効中の版が無ければ getPublished は null を返す(AC: 未発行は 404 相当)', async () => {
		const policies = new InMemoryPolicyRepository([record({ id: 'v1', isPublished: false })]);
		const service = new PublicPolicyService({ policies });

		expect(await service.getPublished(PolicyType.TERMS)).toBeNull();
	});

	test('発効中の版のみ getPublished で取得できる(BR-CONTENT-010)', async () => {
		const policies = new InMemoryPolicyRepository([
			record({ id: 'v1', version: 1, isPublished: false }),
			record({ id: 'v2', version: 2, isPublished: true })
		]);
		const service = new PublicPolicyService({ policies });

		const published = await service.getPublished(PolicyType.TERMS);
		expect(published?.id).toBe('v2');
	});

	test('type が異なる版は対象外になる', async () => {
		const policies = new InMemoryPolicyRepository([
			record({ id: 'privacy-1', type: PolicyType.PRIVACY, isPublished: true })
		]);
		const service = new PublicPolicyService({ policies });

		expect(await service.getPublished(PolicyType.TERMS)).toBeNull();
	});

	test('listVersions は版番号の降順ですべての版(過去版含む)を返す(BR-CONTENT-010: 過去版も参照可能)', async () => {
		const policies = new InMemoryPolicyRepository([
			record({ id: 'v1', version: 1, isPublished: false }),
			record({ id: 'v2', version: 2, isPublished: true }),
			record({
				id: 'v3',
				version: 3,
				isPublished: false,
				effectiveDate: new Date('2026-09-01T00:00:00Z')
			})
		]);
		const service = new PublicPolicyService({ policies });

		const versions = await service.listVersions(PolicyType.TERMS);
		expect(versions.map((v) => v.version)).toEqual([3, 2, 1]);
	});

	test('listVersions は版が無ければ空配列を返す', async () => {
		const service = new PublicPolicyService({ policies: new InMemoryPolicyRepository([]) });
		expect(await service.listVersions(PolicyType.PRIVACY)).toEqual([]);
	});

	test('getVersion は版番号を指定して過去版を取得できる(BR-CONTENT-010: 過去版も参照可能)', async () => {
		const policies = new InMemoryPolicyRepository([
			record({ id: 'v1', version: 1, isPublished: false, bodyMarkdown: '# v1' }),
			record({ id: 'v2', version: 2, isPublished: true, bodyMarkdown: '# v2' })
		]);
		const service = new PublicPolicyService({ policies });

		const v1 = await service.getVersion(PolicyType.TERMS, 1);
		expect(v1?.bodyMarkdown).toBe('# v1');
	});

	test('getVersion は存在しない版番号なら null を返す', async () => {
		const policies = new InMemoryPolicyRepository([record({ id: 'v1', version: 1 })]);
		const service = new PublicPolicyService({ policies });

		expect(await service.getVersion(PolicyType.TERMS, 99)).toBeNull();
	});
});
