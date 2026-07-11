'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button, Input, Label } from '@lib';
import { requestPasswordResetAction } from '@/lib/auth/actions';

export function ResetPasswordForm() {
	const [sent, setSent] = useState(false);
	const [isPending, startTransition] = useTransition();

	function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
		if (!email) return;

		startTransition(async () => {
			await requestPasswordResetAction(email);
			setSent(true);
		});
	}

	if (sent) {
		return (
			<div className="text-center">
				<p className="text-(length:--text-body) text-text-muted">
					ご入力のメールアドレスにリセット用リンクをお送りしました（登録済みの場合）。
					メールをご確認ください。
				</p>
				<Link
					href="/login"
					className="mt-4 inline-block text-(length:--text-meta) text-accent hover:underline"
				>
					ログインページへ
				</Link>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="email" required>
					メールアドレス
				</Label>
				<Input id="email" name="email" type="email" autoComplete="username" required />
			</div>

			<Button type="submit" disabled={isPending}>
				{isPending ? '送信中…' : 'リセットリンクを送信'}
			</Button>

			<Link
				href="/login"
				className="text-center text-(length:--text-caption) text-text-subtle hover:underline"
			>
				ログインに戻る
			</Link>
		</form>
	);
}
