// 状態フィルタ(タブ風リンク)。URL 状態で共有可能にする(ecc-web/patterns: URL As State)。
import Link from 'next/link';
import { cn } from '@lib';

interface StatusFilterProps {
	readonly basePath: string;
	readonly current: string;
	readonly options: ReadonlyArray<readonly [string, string]>;
}

export function StatusFilter({ basePath, current, options }: StatusFilterProps) {
	return (
		<div role="tablist" aria-label="状態フィルタ" className="flex flex-wrap gap-1">
			{options.map(([value, label]) => {
				const active = current === value;
				const href = value ? `${basePath}?status=${value}` : basePath;
				return (
					<Link
						key={value || 'all'}
						href={href}
						aria-current={active ? 'page' : undefined}
						className={cn(
							'rounded-md px-3 py-1.5 text-[length:var(--text-meta)] font-medium transition-colors',
							active
								? 'bg-accent text-accent-contrast'
								: 'text-text-muted hover:bg-surface-sunken hover:text-text'
						)}
					>
						{label}
					</Link>
				);
			})}
		</div>
	);
}
