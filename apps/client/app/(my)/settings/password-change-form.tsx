'use client';

import { useState, useTransition } from 'react';
import { Button, Input, Label } from '@lib';
import { changePasswordAction } from '@/lib/actions';

export function PasswordChangeForm() {
	const [isPending, startTransition] = useTransition();
	const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

	function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
		const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
		const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;

		if (newPassword !== confirm) {
			setMessage({ ok: false, text: '新しいパスワードが一致しません。' });
			return;
		}

		setMessage(null);
		startTransition(async () => {
			const result = await changePasswordAction(currentPassword, newPassword);
			if (result.ok) {
				form.reset();
			}
			setMessage({
				ok: result.ok,
				text: result.ok ? 'パスワードを変更しました。' : (result.error ?? '変更に失敗しました。')
			});
		});
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4 rounded-xl border border-border bg-surface-raised p-6"
		>
			{message ? (
				<p
					role="alert"
					className={`rounded-md px-3 py-2 text-(length:--text-meta) ${
						message.ok
							? 'border border-success/40 bg-success/10 text-success'
							: 'border border-danger/40 bg-danger/10 text-danger'
					}`}
				>
					{message.text}
				</p>
			) : null}

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="currentPassword" required>
					現在のパスワード
				</Label>
				<Input
					id="currentPassword"
					name="currentPassword"
					type="password"
					autoComplete="current-password"
					required
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="newPassword" required>
					新しいパスワード
				</Label>
				<Input
					id="newPassword"
					name="newPassword"
					type="password"
					autoComplete="new-password"
					required
					minLength={10}
					maxLength={128}
				/>
				<p className="text-(length:--text-caption) text-text-subtle">10〜128 文字</p>
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="confirm" required>
					新しいパスワード（確認）
				</Label>
				<Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
			</div>

			<div className="flex justify-end">
				<Button type="submit" disabled={isPending}>
					{isPending ? '変更中…' : 'パスワードを変更'}
				</Button>
			</div>
		</form>
	);
}
