// UI表示用のラベル変換。API の列挙値から日本語表示文字列を返す。
import type { SnsLinkPlatform } from '../api/types';

export function snsLinkPlatformLabel(platform: SnsLinkPlatform): string {
	const labels: Record<SnsLinkPlatform, string> = {
		X: 'X (旧 Twitter)',
		INSTAGRAM: 'Instagram',
		FACEBOOK: 'Facebook',
		LINKEDIN: 'LinkedIn',
		GITHUB: 'GitHub',
		YOUTUBE: 'YouTube',
		TIKTOK: 'TikTok',
		WEBSITE: 'Web サイト'
	};
	return labels[platform] ?? platform;
}

export function reportReasonLabel(category: string): string {
	const labels: Record<string, string> = {
		SPAM: 'スパム',
		NSFW: '不適切なコンテンツ',
		HARASSMENT: '嫌がらせ・ハラスメント',
		IMPERSONATION: 'なりすまし',
		OTHER: 'その他'
	};
	return labels[category] ?? category;
}
