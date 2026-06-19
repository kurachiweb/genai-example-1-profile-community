// テーブルプリミティブ。密度の高い管理一覧向け(design 02-layout §6)。横溢れは横スクロールで吸収する。
import type { HTMLAttributes, ReactNode, ThHTMLAttributes } from 'react';
import { cn } from '@app/frontend-lib';

export function Table({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div className={cn('overflow-x-auto rounded-lg border border-border', className)}>
			<table className="w-full border-collapse text-[length:var(--text-meta)]">{children}</table>
		</div>
	);
}

export function THead({ children }: { children: ReactNode }) {
	return <thead className="bg-surface-sunken text-text-muted">{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
	return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TR({ children, className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
	return (
		<tr className={cn('transition-colors hover:bg-surface-sunken/60', className)} {...rest}>
			{children}
		</tr>
	);
}

export function TH({ children, className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
	return (
		<th
			scope="col"
			className={cn('px-4 py-2.5 text-left font-medium whitespace-nowrap', className)}
			{...rest}
		>
			{children}
		</th>
	);
}

export function TD({ children, className, ...rest }: HTMLAttributes<HTMLTableCellElement>) {
	return (
		<td className={cn('px-4 py-2.5 align-middle text-text', className)} {...rest}>
			{children}
		</td>
	);
}
