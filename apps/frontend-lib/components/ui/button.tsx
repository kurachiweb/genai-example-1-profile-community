// Button プリミティブ（shadcn/ui ベース）。役割トークン（accent/surface/border）でテーマ追従し、
// 4 状態（rest/hover/focus-visible/active/disabled）を設計された見た目として作り込む（design/03 §1）。
// テンプレート然とした素の見た目を避け、コーラルのアクセントは主要アクションに限る（design/00 §3）。
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utilities/cn';

export const buttonVariants = cva(
	cn(
		'inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap',
		'transition-[color,background-color,border-color,box-shadow,transform] outline-none',
		'duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]',
		'focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
		'active:translate-y-px disabled:pointer-events-none disabled:opacity-60',
		'[&_svg]:size-4 [&_svg]:shrink-0'
	),
	{
		variants: {
			variant: {
				primary: 'bg-accent text-accent-contrast shadow-e1 hover:bg-accent-hover',
				outline: 'border border-border bg-surface-raised text-text hover:bg-surface-sunken',
				ghost: 'text-text hover:bg-surface-sunken',
				danger: 'bg-danger text-on-status shadow-e1 hover:opacity-90',
				link: 'text-accent underline-offset-4 hover:underline'
			},
			size: {
				sm: 'h-8 px-3 text-[length:var(--text-meta)]',
				md: 'h-10 px-4 text-[length:var(--text-body)]',
				lg: 'h-11 px-6 text-[length:var(--text-body)]',
				icon: 'size-10'
			}
		},
		defaultVariants: {
			variant: 'primary',
			size: 'md'
		}
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	/** Slot で子要素（例: アンカー）へ装いを委譲する（合成パターン）。 */
	readonly asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ className, variant, size, asChild = false, type, ...props },
	ref
) {
	const Comp = asChild ? Slot : 'button';
	return (
		<Comp
			ref={ref}
			// asChild 時は type を子へ委譲しない（button 以外に type は不正なため）。
			type={asChild ? undefined : (type ?? 'button')}
			className={cn(buttonVariants({ variant, size }), className)}
			{...props}
		/>
	);
});
