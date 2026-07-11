'use client';

import { useState, useTransition } from 'react';
import { Button, Input, Label } from '@lib';
import { requestEmailChangeAction } from '@/lib/actions';

export function EmailChangeForm() {
	const [isPending, startTransition] = useTransition();
	const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

	function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const newEmail = (form.elements.namedItem('newEmail') as HTMLInputElement).value.trim();
		const password = (form.elements.namedItem('password') as HTMLInputElement).value;

		setMessage(null);
		startTransition(async () => {
			const result = await requestEmailChangeAction(newEmail, password);
			if (result.ok) form.reset();
			setMessage({
				ok: result.ok,
				text: result.ok
					? '確認メールを送信しました。新しいメールアドレスの受信トレイをご確認ください。'
					: (result.error ?? '変更リクエストに失敗しました。')
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
				<Label htmlFor="newEmail" required>
					新しいメールアドレス
				</Label>
				<Input id="newEmail" name="newEmail" type="email" autoComplete="email" required />
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="emailPassword" required>
					現在のパスワード（確認）
				</Label>
				<Input
					id="emailPassword"
					name="password"
					type="password"
					autoComplete="current-password"
					required
				/>
			</div>

			<div className="flex justify-end">
				<Button type="submit" disabled={isPending}>
					{isPending ? '送信中…' : '変更リクエストを送信'}
				</Button>
			</div>
		</form>
	);
}
