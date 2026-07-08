'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@lib';
import { resetPasswordAction } from '@/lib/auth/actions';

interface Props {
	readonly token: string;
}

export function ResetPasswordConfirmForm({ token }: Props) {
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
		const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;

		if (newPassword !== confirm) {
			setError('パスワードが一致しません。');
			return;
		}

		setError(null);
		startTransition(async () => {
			const result = await resetPasswordAction(token, newPassword);
			if (!result.ok) {
				setError(result.error ?? 'パスワードのリセットに失敗しました。');
				return;
			}
			router.replace('/login?reset=1');
		});
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
			{error ? (
				<p
					role="alert"
					className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-(length:--text-meta) text-danger"
				>
					{error}
				</p>
			) : null}

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
				<p className="text-(length:--text-caption) text-text-subtle">
					10〜128 文字で設定してください。
				</p>
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="confirm" required>
					新しいパスワード（確認）
				</Label>
				<Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
			</div>

			<Button type="submit" disabled={isPending}>
				{isPending ? '設定中…' : 'パスワードを設定'}
			</Button>
		</form>
	);
}
