// ページ見出し。スケールコントラストで階層をつくる(design/01 §3)。右側に操作スロット。
import type { ReactNode } from 'react';

interface PageHeaderProps {
	readonly title: string;
	readonly description?: string;
	readonly actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
	return (
		<div className="mb-6 flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 className="text-(length:--text-title) font-semibold tracking-tight text-text">
					{title}
				</h1>
				{description ? (
					<p className="mt-1 text-(length:--text-meta) text-text-muted">{description}</p>
				) : null}
			</div>
			{actions ? <div className="flex items-center gap-2">{actions}</div> : null}
		</div>
	);
}
