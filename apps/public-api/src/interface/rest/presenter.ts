// Presenter(Output Boundary 相当): ユースケースのレコードを公開 ViewModel へ変換する。
// 表示名の導出など「表現の組み立て」をここで行い、非公開属性は出力しない(BR-API-005)。
import { buildDisplayName, NameDisplayOrder } from '../../domain/display-name';
import { ProfileWithLinks } from '../../application/public-profile.service';
import { ProfileRecord, SnsLinkRecord } from '../../application/models';
import { ProfileView, SnsLinkView } from './dto/profile-view';

function presentSnsLink(record: SnsLinkRecord): SnsLinkView {
	const view = new SnsLinkView();
	view.platform = record.platform;
	view.url = record.url;
	view.label = record.label;
	view.sortOrder = record.sortOrder;
	return view;
}

function presentProfileRecord(record: ProfileRecord, links: readonly SnsLinkRecord[]): ProfileView {
	const view = new ProfileView();
	view.handle = record.handle;
	view.displayName = buildDisplayName(
		record.firstName,
		record.lastName,
		record.nameDisplayOrder as NameDisplayOrder
	);
	view.firstName = record.firstName;
	view.lastName = record.lastName;
	view.nameDisplayOrder = record.nameDisplayOrder;
	view.occupation = record.occupation;
	view.bio = record.bio;
	view.iconImageId = record.iconImageId;
	view.visibility = record.visibility;
	view.snsLinks = links.map(presentSnsLink);
	view.createdAt = record.createdAt.toISOString();
	view.updatedAt = record.updatedAt.toISOString();
	return view;
}

export function presentProfile(result: ProfileWithLinks): ProfileView {
	return presentProfileRecord(result.profile, result.snsLinks);
}
