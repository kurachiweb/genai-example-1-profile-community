'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button, Input, Label } from '@app/frontend-lib';
import { requestPasswordReset } from '@/lib/api/client';

export function ResetPasswordForm() {
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
		if (!email) return;

		setError(null);
		startTransition(async () => {
			try {
				await requestPasswordReset(email);
				setSent(true);
			} catch {
				setError('送信に失敗しました。時間をおいて再度お試しください。');
			}
		});
	}

	if (sent) {
		return (
			<div className="text-center">
				<p className="text-[length:var(--text-body)] text-text-muted">
					ご入力のメールアドレスにリセット用リンクをお送りしました（登録済みの場合）。
					メールをご確認ください。
				</p>
				<Link
					href="/login"
					className="mt-4 inline-block text-[length:var(--text-meta)] text-accent hover:underline"
				>
					ログインページへ
				</Link>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
			{error ? (
				<p
					role="alert"
					className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[length:var(--text-meta)] text-danger"
				>
					{error}
				</p>
			) : null}

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
				className="text-center text-[length:var(--text-caption)] text-text-subtle hover:underline"
			>
				ログインに戻る
			</Link>
		</form>
	);
}
