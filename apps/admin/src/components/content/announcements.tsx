// お知らせの作成/編集フォームと行操作(クライアント)。本文はマークダウン。重要操作は確認ダイアログ。
'use client';

import { useRef, useState, useTransition } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { Button, Input, Label } from '@app/frontend-lib';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
	deleteAnnouncementAction,
	publishAnnouncementAction,
	saveAnnouncementAction,
	unpublishAnnouncementAction
} from '@/lib/content-actions';
import type { Announcement } from '@/lib/api/content-types';

function toLocalInput(iso: string | null | undefined): string {
	if (!iso) return '';
	const date = new Date(iso);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function fromLocalInput(value: string): string | undefined {
	return value ? new Date(value).toISOString() : undefined;
}

const FIELD =
	'h-10 rounded-md border border-border bg-surface-raised px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-focus-ring';

export function AnnouncementFormDialog({ announcement }: { announcement?: Announcement }) {
	const ref = useRef<HTMLDialogElement>(null);
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);
	const [title, setTitle] = useState(announcement?.title ?? '');
	const [body, setBody] = useState(announcement?.bodyMarkdown ?? '');
	const [importance, setImportance] = useState(announcement?.importance ?? 'normal');
	const [startAt, setStartAt] = useState(toLocalInput(announcement?.publishStartAt));
	const [endAt, setEndAt] = useState(toLocalInput(announcement?.publishEndAt));
	const isEdit = Boolean(announcement);

	function save() {
		setError(null);
		startTransition(async () => {
			const result = await saveAnnouncementAction(announcement?.id ?? null, {
				title,
				bodyMarkdown: body,
				importance,
				publishStartAt: fromLocalInput(startAt),
				publishEndAt: fromLocalInput(endAt)
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
					{isEdit ? 'お知らせを編集' : 'お知らせを作成'}
				</h2>
				<div className="mt-4 flex flex-col gap-3">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="an-title" required>
							タイトル
						</Label>
						<Input
							id="an-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							maxLength={120}
						/>
					</div>
					<div className="flex flex-wrap gap-3">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="an-importance">重要度</Label>
							<select
								id="an-importance"
								value={importance}
								onChange={(e) => setImportance(e.target.value)}
								className={FIELD}
							>
								<option value="normal">通常</option>
								<option value="important">重要</option>
							</select>
						</div>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="an-start">公開開始(任意)</Label>
							<input
								id="an-start"
								type="datetime-local"
								value={startAt}
								onChange={(e) => setStartAt(e.target.value)}
								className={FIELD}
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="an-end">公開終了(任意)</Label>
							<input
								id="an-end"
								type="datetime-local"
								value={endAt}
								onChange={(e) => setEndAt(e.target.value)}
								className={FIELD}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="an-body">本文(マークダウン)</Label>
						<textarea
							id="an-body"
							value={body}
							onChange={(e) => setBody(e.target.value)}
							rows={10}
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

export function AnnouncementRowActions({ id, status }: { id: string; status: string }) {
	return (
		<div className="flex flex-wrap justify-end gap-2">
			{status === 'published' ? (
				<ConfirmDialog
					triggerLabel="非公開にする"
					triggerVariant="ghost"
					title="お知らせを非公開にしますか？"
					confirmLabel="非公開にする"
					confirmVariant="outline"
					auditNotice={false}
					onConfirm={() => unpublishAnnouncementAction(id)}
				/>
			) : (
				<ConfirmDialog
					triggerLabel="公開する"
					triggerVariant="primary"
					title="お知らせを公開しますか？"
					description="公開開始日時が未設定の場合は即時公開されます。"
					confirmLabel="公開する"
					onConfirm={() => publishAnnouncementAction(id)}
				/>
			)}
			<ConfirmDialog
				triggerLabel="削除"
				triggerVariant="danger"
				title="お知らせを削除しますか？"
				confirmLabel="削除する"
				confirmVariant="danger"
				auditNotice={false}
				onConfirm={() => deleteAnnouncementAction(id)}
			/>
		</div>
	);
}
