// ヘルプ記事の作成/編集と公開切替(クライアント、BR-CONTENT-005)。
'use client';

import { useRef, useState, useTransition } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { Button, Input, Label } from '@lib';
import { saveHelpArticleAction, setHelpArticleStatusAction } from '@/lib/content-actions';
import type { HelpArticle } from '@/lib/api/content-types';

const FIELD =
	'h-10 rounded-md border border-border bg-surface-raised px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-focus-ring';

export function HelpFormDialog({ article }: { article?: HelpArticle }) {
	const ref = useRef<HTMLDialogElement>(null);
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);
	const [title, setTitle] = useState(article?.title ?? '');
	const [slug, setSlug] = useState(article?.slug ?? '');
	const [category, setCategory] = useState(article?.category ?? '');
	const [body, setBody] = useState(article?.bodyMarkdown ?? '');
	const [status, setStatus] = useState(article?.status ?? 'unpublished');
	const isEdit = Boolean(article);

	function save() {
		setError(null);
		startTransition(async () => {
			const result = await saveHelpArticleAction({
				id: article?.id,
				title,
				slug,
				category: category || undefined,
				bodyMarkdown: body,
				status
			});
			if (result.ok) {
				ref.current?.close();
			} else {
				setError(result.error ?? '保存に失敗しました。');
			}
		});
	}

	return (
		<>
			<Button
				type="button"
				variant={isEdit ? 'outline' : 'primary'}
				size="sm"
				onClick={() => {
					setError(null);
					ref.current?.showModal();
				}}
			>
				{isEdit ? (
					<Pencil className="size-4" aria-hidden="true" />
				) : (
					<Plus className="size-4" aria-hidden="true" />
				)}
				{isEdit ? '編集' : '新規作成'}
			</Button>
			<dialog
				ref={ref}
				className="m-auto w-[min(40rem,94vw)] rounded-xl border border-border bg-surface-raised p-6 text-text shadow-e3 backdrop:bg-black/40"
			>
				<h2 className="text-[length:var(--text-title)] font-semibold text-text">
					{isEdit ? 'ヘルプ記事を編集' : 'ヘルプ記事を作成'}
				</h2>
				<div className="mt-4 flex flex-col gap-3">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="hp-title" required>
							タイトル
						</Label>
						<Input
							id="hp-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							maxLength={120}
						/>
					</div>
					<div className="flex flex-wrap gap-3">
						<div className="flex flex-1 flex-col gap-1.5">
							<Label htmlFor="hp-slug" required>
								スラッグ
							</Label>
							<Input
								id="hp-slug"
								value={slug}
								onChange={(e) => setSlug(e.target.value)}
								placeholder="getting-started"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="hp-category">カテゴリ(任意)</Label>
							<Input
								id="hp-category"
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								className="w-44"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="hp-status">公開状態</Label>
							<select
								id="hp-status"
								value={status}
								onChange={(e) => setStatus(e.target.value)}
								className={FIELD}
							>
								<option value="unpublished">非公開</option>
								<option value="published">公開</option>
							</select>
						</div>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="hp-body">本文(マークダウン)</Label>
						<textarea
							id="hp-body"
							value={body}
							onChange={(e) => setBody(e.target.value)}
							rows={12}
							className="resize-y rounded-md border border-border bg-surface-raised px-3 py-2 font-mono text-[length:var(--text-meta)] text-text outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
						/>
					</div>
					{error ? (
						<p
							role="alert"
							className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[length:var(--text-meta)] text-danger"
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
						{pending ? '保存中…' : '保存'}
					</Button>
				</div>
			</dialog>
		</>
	);
}

export function HelpStatusToggle({ id, status }: { id: string; status: string }) {
	const [pending, startTransition] = useTransition();
	const next = status === 'published' ? 'unpublished' : 'published';
	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			disabled={pending}
			onClick={() =>
				startTransition(() => setHelpArticleStatusAction(id, next).then(() => undefined))
			}
		>
			{status === 'published' ? '非公開にする' : '公開する'}
		</Button>
	);
}
