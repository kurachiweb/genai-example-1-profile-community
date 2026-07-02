// メール通知の作成・テスト送信・配信(クライアント、BR-CONTENT-003)。配信は確認＋監査明示。
'use client';

import { useRef, useState, useTransition } from 'react';
import { Plus, Send } from 'lucide-react';
import { Button, Input, Label } from '@lib';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
	createEmailNotificationAction,
	sendEmailNotificationAction,
	testSendEmailAction
} from '@/lib/content-actions';
import type { EmailTemplate } from '@/lib/api/content-types';

const FIELD =
	'h-10 rounded-md border border-border bg-surface-raised px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-focus-ring';

export function EmailComposeForm({ templates }: { templates: EmailTemplate[] }) {
	const ref = useRef<HTMLDialogElement>(null);
	const [pending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);
	const [subject, setSubject] = useState('');
	const [templateKey, setTemplateKey] = useState(templates[0]?.key ?? 'announcement');
	const [target, setTarget] = useState('all');

	function save() {
		setError(null);
		startTransition(async () => {
			const result = await createEmailNotificationAction({
				subject,
				templateKey,
				targetCondition: target
			});
			if (result.ok) {
				ref.current?.close();
				setSubject('');
			} else {
				setError(result.error ?? '作成に失敗しました。');
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
				下書きを作成
			</Button>
			<dialog
				ref={ref}
				className="m-auto w-[min(34rem,94vw)] rounded-xl border border-border bg-surface-raised p-6 text-text shadow-e3 backdrop:bg-black/40"
			>
				<h2 className="text-(length:--text-title) font-semibold text-text">メール通知の下書き</h2>
				<div className="mt-4 flex flex-col gap-3">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="em-subject" required>
							件名
						</Label>
						<Input
							id="em-subject"
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
							maxLength={200}
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="em-template">テンプレート</Label>
						<select
							id="em-template"
							value={templateKey}
							onChange={(e) => setTemplateKey(e.target.value)}
							className={FIELD}
						>
							{templates.map((t) => (
								<option key={t.key} value={t.key}>
									{t.label}
								</option>
							))}
						</select>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="em-target">配信対象</Label>
						<select
							id="em-target"
							value={target}
							onChange={(e) => setTarget(e.target.value)}
							className={FIELD}
						>
							<option value="all">全利用者(受信設定オン)</option>
							<option value="verified">メール確認済みのみ</option>
						</select>
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
						{pending ? '作成中…' : '作成'}
					</Button>
				</div>
			</dialog>
		</>
	);
}

function TestSendButton({ id }: { id: string }) {
	const [email, setEmail] = useState('');
	return (
		<ConfirmDialog
			triggerLabel="テスト送信"
			triggerVariant="ghost"
			triggerSize="sm"
			title="テスト送信"
			description="指定したアドレスに 1 通だけ送信します(配信状態は変わりません)。"
			confirmLabel="送信する"
			auditNotice={false}
			onConfirm={() =>
				email
					? testSendEmailAction(id, email)
					: Promise.resolve({ ok: false, error: 'テスト送信先のメールを入力してください。' })
			}
		>
			<Label htmlFor={`test-${id}`}>送信先メール</Label>
			<Input
				id={`test-${id}`}
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				className="mt-1.5"
			/>
		</ConfirmDialog>
	);
}

export function EmailRowActions({ id, status }: { id: string; status: string }) {
	if (status === 'sent') {
		return <span className="text-(length:--text-caption) text-text-subtle">配信済み</span>;
	}
	return (
		<div className="flex flex-wrap justify-end gap-2">
			<TestSendButton id={id} />
			<ConfirmDialog
				triggerLabel="配信する"
				triggerVariant="primary"
				triggerSize="sm"
				triggerIcon={<Send className="size-4" aria-hidden="true" />}
				title="このメール通知を配信しますか？"
				description="受信設定がオンの対象利用者に配信します。配信は取り消せません。"
				confirmLabel="配信する"
				onConfirm={() => sendEmailNotificationAction(id)}
			/>
		</div>
	);
}
