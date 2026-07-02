// 規約の新版作成と発効(クライアント、BR-CONTENT-008/009)。super_admin のみ(apiで強制)。
'use client';

import { useRef, useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { Button, Label } from '@lib';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { createPolicyVersionAction, publishPolicyAction } from '@/lib/content-actions';

const FIELD =
	'h-10 rounded-md border border-border bg-surface-raised px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-focus-ring';

export function PolicyVersionForm({ type }: { type: string }) {
	const ref = useRef<HTMLDialogElement>(null);
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);
	const [body, setBody] = useState('');
	const [reconsent, setReconsent] = useState(false);
	const [effectiveDate, setEffectiveDate] = useState('');

	function save() {
		setError(null);
		startTransition(async () => {
			const result = await createPolicyVersionAction({
				type,
				bodyMarkdown: body,
				requiresReconsent: reconsent,
				effectiveDate: effectiveDate
					? new Date(effectiveDate).toISOString()
					: new Date().toISOString()
			});
			if (result.ok) {
				ref.current?.close();
				setBody('');
			} else {
				setError(result.error ?? '保存に失敗しました。');
			}
		});
	}

	return (
		<>
			<Button
				type="button"
				size="sm"
				onClick={() => {
					setError(null);
					ref.current?.showModal();
				}}
			>
				<Plus className="size-4" aria-hidden="true" />
				新版を作成
			</Button>
			<dialog
				ref={ref}
				className="m-auto w-[min(40rem,94vw)] rounded-xl border border-border bg-surface-raised p-6 text-text shadow-e3 backdrop:bg-black/40"
			>
				<h2 className="text-(length:--text-title) font-semibold text-text">新しい版を作成</h2>
				<p className="mt-1 text-(length:--text-caption) text-text-muted">
					作成後に発効すると公開中の版が切り替わります。旧版は履歴として保持されます。
				</p>
				<div className="mt-4 flex flex-col gap-3">
					<div className="flex flex-wrap items-end gap-3">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="po-effective">発効日</Label>
							<input
								id="po-effective"
								type="datetime-local"
								value={effectiveDate}
								onChange={(e) => setEffectiveDate(e.target.value)}
								className={FIELD}
							/>
						</div>
						<label className="flex items-center gap-2 text-(length:--text-meta)">
							<input
								type="checkbox"
								checked={reconsent}
								onChange={(e) => setReconsent(e.target.checked)}
								className="size-4"
							/>
							重要な改定(再同意を求める)
						</label>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="po-body">本文(マークダウン)</Label>
						<textarea
							id="po-body"
							value={body}
							onChange={(e) => setBody(e.target.value)}
							rows={14}
							className="resize-y rounded-md border border-border bg-surface-raised px-3 py-2 font-mono text-(length:--text-meta) text-text outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
						/>
					</div>
					{error ? (
						<p
							role="alert"
							className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-(length:--text-meta) text-danger"
						>
							{error}
						</p>
					) : null}
				</div>
				<div className="mt-5 flex justify-end gap-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => ref.current?.close()}
						disabled={pending}
					>
						キャンセル
					</Button>
					<Button type="button" size="sm" onClick={save} disabled={pending}>
						{pending ? '保存中…' : '作成'}
					</Button>
				</div>
			</dialog>
		</>
	);
}

export function PublishPolicyButton({ id }: { id: string }) {
	return (
		<ConfirmDialog
			triggerLabel="この版を発効する"
			triggerVariant="primary"
			triggerSize="sm"
			title="この版を発効しますか？"
			description="公開中の版が切り替わります。旧版は履歴として保持されます。重要改定の場合は次回ログイン時に再同意を求めます。"
			confirmLabel="発効する"
			onConfirm={() => publishPolicyAction(id)}
		/>
	);
}
