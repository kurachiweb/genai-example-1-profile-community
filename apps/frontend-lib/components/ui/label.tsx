// Label プリミティブ。入力との関連付け（htmlFor）を前提にする（design/04 §4.3）。
// 簡易な要素のため外部パッケージ（radix-label）は導入せず、ネイティブ label を装う（CLAUDE.md 方針）。
import * as React from 'react';
import { cn } from '@/utilities/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
	/** 必須項目であることを視覚＋支援技術の双方に伝える。 */
	readonly required?: boolean;
}

export function Label({ className, required = false, children, ...props }: LabelProps) {
	return (
		<label
			className={cn(
				'inline-flex items-center gap-1 text-[length:var(--text-meta)] font-medium text-text',
				className
			)}
			{...props}
		>
			{children}
			{required ? (
				<span className="text-danger" aria-hidden="true">
					*
				</span>
			) : null}
		</label>
	);
}
