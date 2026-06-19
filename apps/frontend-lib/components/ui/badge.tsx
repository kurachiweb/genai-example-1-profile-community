// Badge プリミティブ。状態（成功/警告/危険/情報）を色だけに依存させず、
// アイコン＋テキスト併用を前提に tone を用意する（design/01 §2.3・design/04 §4.2）。
// ドメインの状態（User の ACTIVE/FROZEN など）→ tone の対応づけは各アプリ側で行い、本層は汎用に保つ。
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utilities/cn';

export const badgeVariants = cva(
	'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[length:var(--text-caption)] font-medium [&_svg]:size-3 [&_svg]:shrink-0',
	{
		variants: {
			tone: {
				neutral: 'border-border bg-surface-sunken text-text-muted',
				accent: 'border-transparent bg-accent text-accent-contrast',
				success: 'border-transparent bg-success text-on-status',
				warning: 'border-transparent bg-warning text-on-status',
				danger: 'border-transparent bg-danger text-on-status',
				info: 'border-transparent bg-info text-on-status',
				outline: 'border-border-strong bg-transparent text-text'
			}
		},
		defaultVariants: {
			tone: 'neutral'
		}
	}
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
	return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
