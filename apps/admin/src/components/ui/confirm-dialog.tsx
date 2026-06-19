// 確認ダイアログ(ネイティブ <dialog>・フォーカストラップ/Esc 標準対応)。重要操作の確認に用いる(design 02-layout §6・design/03 §10)。
'use client';

import { useId, useRef, useState, useTransition, type ReactNode } from 'react';
import { Button, type ButtonProps } from '@app/frontend-lib';
import type { ActionResult } from '@/lib/actions';

interface ConfirmDialogProps {
	readonly triggerLabel: ReactNode;
	readonly triggerVariant?: ButtonProps['variant'];
	readonly triggerSize?: ButtonProps['size'];
	readonly triggerIcon?: ReactNode;
	readonly title: string;
	readonly description?: string;
	readonly confirmLabel: string;
	readonly confirmVariant?: ButtonProps['variant'];
	readonly onConfirm: () => Promise<ActionResult>;
	/** 追加の入力(例: 凍結理由の選択)。 */
	readonly children?: ReactNode;
	/** 監査ログ対象である旨を表示する(BR-COMMON-013)。 */
	readonly auditNotice?: boolean;
}

export function ConfirmDialog({
	triggerLabel,
	triggerVariant = 'outline',
	triggerSize = 'sm',
	triggerIcon,
	title,
	description,
	confirmLabel,
	confirmVariant = 'primary',
	onConfirm,
	children,
	auditNotice = true
}: ConfirmDialogProps) {
	const ref = useRef<HTMLDialogElement>(null);
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);
	const titleId = useId();

	function open() {
		setError(null);
		ref.current?.showModal();
	}
	function close() {
		ref.current?.close();
	}
	function confirm() {
		startTransition(async () => {
			const result = await onConfirm();
			if (result.ok) {
				close();
			} else {
				setError(result.error ?? '操作に失敗しました。');
			}
		});
	}

	return (
		<>
			<Button type="button" variant={triggerVariant} size={triggerSize} onClick={open}>
				{triggerIcon}
				{triggerLabel}
			</Button>
			<dialog
				ref={ref}
				aria-labelledby={titleId}
				onClose={() => setError(null)}
				className="m-auto w-[min(28rem,92vw)] rounded-xl border border-border bg-surface-raised p-6 text-text shadow-e3 backdrop:bg-black/40"
			>
				<h2 id={titleId} className="text-[length:var(--text-title)] font-semibold text-text">
					{title}
				</h2>
				{description ? (
					<p className="mt-1 text-[length:var(--text-meta)] text-text-muted">{description}</p>
				) : null}
				{children ? <div className="mt-4">{children}</div> : null}
				{auditNotice ? (
					<p className="mt-3 text-[length:var(--text-caption)] text-text-subtle">
						この操作は監査ログに記録されます。
					</p>
				) : null}
				{error ? (
					<p
						role="alert"
						className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[length:var(--text-meta)] text-danger"
					>
						{error}
					</p>
				) : null}
				<div className="mt-5 flex justify-end gap-2">
					<Button type="button" variant="ghost" size="sm" onClick={close} disabled={pending}>
						キャンセル
					</Button>
					<Button
						type="button"
						variant={confirmVariant}
						size="sm"
						onClick={confirm}
						disabled={pending}
					>
						{pending ? '処理中…' : confirmLabel}
					</Button>
				</div>
			</dialog>
		</>
	);
}
