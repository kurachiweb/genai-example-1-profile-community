// SnsLink の DataLoader(N+1 回避、api/01-graphql-internal.md §5)。
// リクエストスコープで生成し、リクエストをまたいでキャッシュを共有しない(古いデータ・権限混線の防止)。
import DataLoader from 'dataloader';
import { ProfileService } from '../../application/profile.service';
import { SnsLinkRecord } from '../../application/models';

export type SnsLinkLoader = DataLoader<string, SnsLinkRecord[]>;

export function createSnsLinkLoader(service: ProfileService): SnsLinkLoader {
	return new DataLoader<string, SnsLinkRecord[]>(async (profileIds) => {
		const all = await service.getSnsLinksByProfileIds(profileIds);
		const byProfile = new Map<string, SnsLinkRecord[]>();
		for (const link of all) {
			const bucket = byProfile.get(link.profileId);
			if (bucket) {
				bucket.push(link);
			} else {
				byProfile.set(link.profileId, [link]);
			}
		}
		// load の要求順と同じ順序・件数で返す(DataLoader の契約)。
		return profileIds.map((id) => byProfile.get(id) ?? []);
	});
}
