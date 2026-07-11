// SNS リンク一覧。各プラットフォームのアイコン付きリンクを表示する。
import { ExternalLink, Globe } from 'lucide-react';
import type { SnsLink } from '@/lib/api/types';
import { snsLinkPlatformLabel } from '@/lib/i18n/labels';

function PlatformIcon({ platform }: { platform: string }) {
	const className = 'size-4 shrink-0';
	// lucide-react v1 系でブランドアイコン（GitHub 等）が削除されたため、
	// プラットフォーム名はテキストラベルで示し、アイコンは汎用のものを用いる。
	switch (platform) {
		case 'WEBSITE':
			return <Globe className={className} aria-hidden="true" />;
		default:
			return <ExternalLink className={className} aria-hidden="true" />;
	}
}

// 外部 URL のスキームを安全に検証する(XSS 防止)。
function safeUrl(url: string): string | undefined {
	try {
		const parsed = new URL(url);
		if (['http:', 'https:'].includes(parsed.protocol)) return url;
	} catch {
		return undefined;
	}
	return undefined;
}

interface Props {
	readonly links: readonly SnsLink[];
}

export function SnsLinks({ links }: Props) {
	if (links.length === 0) return null;

	const sorted = [...links].sort((a, b) => a.displayOrder - b.displayOrder);

	return (
		<ul className="flex flex-wrap gap-2" aria-label="SNS リンク">
			{sorted.map((link) => {
				const href = safeUrl(link.url);
				if (!href) return null;
				return (
					<li key={link.id}>
						<a
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-(length:--text-caption) text-text-muted transition-colors hover:border-accent/40 hover:text-text"
						>
							<PlatformIcon platform={link.platform} />
							{snsLinkPlatformLabel(link.platform)}
						</a>
					</li>
				);
			})}
		</ul>
	);
}
