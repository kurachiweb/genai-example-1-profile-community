// Input プリミティブ。フォーカス可視・無効状態を設計された見た目で作り込む（design/03 §1）。
// 不正状態は aria-invalid を真にし、色だけに依存せず枠色＋メッセージで伝える（design/04 §4.3）。
import * as React from 'react';
import { cn } from '../../utilities/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
	{ className, type = 'text', ...props },
	ref
) {
	return (
		<input
			ref={ref}
			type={type}
			className={cn(
				'h-10 w-full rounded-md border border-border bg-surface-raised px-3 text-[length:var(--text-body)] text-text',
				'placeholder:text-text-subtle',
				'transition-[border-color,box-shadow] duration-[var(--duration-fast)] outline-none',
				'focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
				'disabled:cursor-not-allowed disabled:opacity-60',
				'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger',
				className
			)}
			{...props}
		/>
	);
});
