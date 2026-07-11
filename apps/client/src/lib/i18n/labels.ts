// UI表示用のラベル変換。API の列挙値から日本語表示文字列を返す。
import type { SnsLinkPlatform } from '../api/types';

export function snsLinkPlatformLabel(platform: SnsLinkPlatform): string {
	const labels: Record<SnsLinkPlatform, string> = {
		x: 'X (旧 Twitter)',
		instagram: 'Instagram',
		facebook: 'Facebook',
		linkedin: 'LinkedIn',
		github: 'GitHub',
		youtube: 'YouTube',
		tiktok: 'TikTok',
		website: 'Web サイト'
	};
	return labels[platform] ?? platform;
}

export function reportReasonLabel(category: string): string {
	const labels: Record<string, string> = {
		SPAM: 'スパム',
		INAPPROPRIATE_IMAGE: '不適切なコンテンツ',
		HARASSMENT: '嫌がらせ・ハラスメント',
		IMPERSONATION: 'なりすまし',
		OTHER: 'その他'
	};
	return labels[category] ?? category;
}
