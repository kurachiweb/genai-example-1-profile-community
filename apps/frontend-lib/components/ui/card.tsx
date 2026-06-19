// Card（Bento タイル）プリミティブ。サーフェス＋角丸＋エレベーションで「浮き」を表す（design/01 §5）。
// elevation で重要度の階層差を表現できるよう、すべてに同じ影を当てない（design/00 §3.3）。
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utilities/cn';

export const cardVariants = cva('rounded-lg border border-border bg-surface-raised', {
	variants: {
		elevation: {
			0: 'shadow-none',
			1: 'shadow-e1',
			2: 'shadow-e2',
			3: 'shadow-e3'
		},
		padding: {
			none: 'p-0',
			sm: 'p-4',
			md: 'p-5',
			lg: 'p-6'
		}
	},
	defaultVariants: {
		elevation: 1,
		padding: 'md'
	}
});

export interface CardProps
	extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, elevation, padding, ...props }: CardProps) {
	return <div className={cn(cardVariants({ elevation, padding }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('flex flex-col gap-1', className)} {...props} />;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
	readonly as?: 'h2' | 'h3' | 'h4';
}

export function CardTitle({ className, as: Tag = 'h3', ...props }: CardTitleProps) {
	return (
		<Tag
			className={cn(
				'text-[length:var(--text-title)] leading-tight font-semibold text-text',
				className
			)}
			{...props}
		/>
	);
}

export function CardDescription({
	className,
	...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
	return (
		<p className={cn('text-[length:var(--text-meta)] text-text-muted', className)} {...props} />
	);
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('mt-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn('mt-4 flex items-center gap-2', className)} {...props} />;
}
