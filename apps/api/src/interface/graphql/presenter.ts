// Presenter(Output Boundary 相当): ユースケースのレコードを GraphQL ViewModel へ変換する。
// 表示名の導出など「表現の組み立て」をここで行い、ドメインの値を素直に写す。
import { buildDisplayName, NameDisplayOrder } from '../../domain/display-name';
import { ProfileConnectionResult } from '../../application/profile.service';
import { ProfileRecord, SnsLinkRecord } from '../../application/models';
import { ProfileConnectionType } from './types/profile-connection.type';
import { ProfileType } from './types/profile.type';
import { SnsLinkType } from './types/sns-link.type';

/** Cloudflare Images の base URL。iconImageId からアイコン URL を構築する。 */
function resolveIconUrl(iconImageId: string | null): string | null {
	if (!iconImageId) return null;
	const base = process.env.ICON_BASE_URL;
	if (!base) return null;
	// base URL の末尾スラッシュを正規化して結合する。
	return `${base.replace(/\/$/, '')}/${iconImageId}/public`;
}

export function presentProfile(record: ProfileRecord): ProfileType {
	const view = new ProfileType();
	view.id = record.id;
	view.userId = record.userId;
	view.handle = record.handle;
	view.displayName = buildDisplayName(
		record.firstName,
		record.lastName,
		record.nameDisplayOrder as NameDisplayOrder
	);
	view.firstName = record.firstName;
	view.lastName = record.lastName;
	view.nameDisplayOrder = record.nameDisplayOrder;
	view.visibility = record.visibility;
	view.iconImageId = record.iconImageId;
	view.iconUrl = resolveIconUrl(record.iconImageId);
	view.occupation = record.occupation;
	view.bio = record.bio;
	view.createdAt = record.createdAt;
	view.updatedAt = record.updatedAt;
	return view;
}

export function presentSnsLink(record: SnsLinkRecord): SnsLinkType {
	const view = new SnsLinkType();
	view.id = record.id;
	view.platform = record.platform;
	view.url = record.url;
	view.label = record.label;
	view.displayOrder = record.sortOrder;
	view.sortOrder = record.sortOrder;
	return view;
}

export function presentProfileConnection(result: ProfileConnectionResult): ProfileConnectionType {
	const connection = new ProfileConnectionType();
	connection.edges = result.edges.map((edge) => ({
		node: presentProfile(edge.node),
		cursor: edge.cursor
	}));
	connection.pageInfo = { hasNextPage: result.hasNextPage, endCursor: result.endCursor };
	return connection;
}
