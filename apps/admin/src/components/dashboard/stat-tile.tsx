// 統計 Bento タイル。スケールコントラストで数値を主役にする(design/01 §3・§5)。
import type { LucideIcon } from 'lucide-react';
import { Card } from '@lib';

interface StatTileProps {
	readonly label: string;
	readonly value: number;
	readonly icon: LucideIcon;
	readonly emphasis?: boolean;
}

export function StatTile({ label, value, icon: Icon, emphasis = false }: StatTileProps) {
	return (
		<Card padding="md" elevation={emphasis ? 2 : 1}>
			<div className="flex items-start justify-between gap-2">
				<span className="text-(length:--text-meta) text-text-muted">{label}</span>
				<Icon className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
			</div>
			<p className="mt-2 text-3xl font-bold text-text tabular-nums">
				{value.toLocaleString('ja-JP')}
			</p>
		</Card>
	);
}
