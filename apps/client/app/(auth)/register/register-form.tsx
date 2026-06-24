'use client';

import { useActionState } from 'react';
import { Button, Input, Label } from '@lib';
import { registerAction, type AuthState } from '@/lib/auth/actions';

export function RegisterForm() {
	const [state, formAction, pending] = useActionState<AuthState, FormData>(registerAction, {});

	return (
		<form action={formAction} className="flex flex-col gap-4" noValidate>
			<div>
				<h2 className="text-[length:var(--text-title)] font-semibold text-text">
					アカウントを作成
				</h2>
				<p className="mt-1 text-[length:var(--text-meta)] text-text-muted">
					登録後、確認メールをお送りします。
				</p>
			</div>

			{state.error ? (
				<p
					role="alert"
					className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[length:var(--text-meta)] text-danger"
				>
					{state.error}
				</p>
			) : null}

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="email" required>
					メールアドレス
				</Label>
				<Input id="email" name="email" type="email" autoComplete="username" required />
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="password" required>
					パスワード
				</Label>
				<Input
					id="password"
					name="password"
					type="password"
					autoComplete="new-password"
					required
					minLength={10}
					maxLength={128}
				/>
				<p className="text-[length:var(--text-caption)] text-text-subtle">
					10〜128 文字で設定してください。
				</p>
			</div>

			<Button type="submit" disabled={pending} className="mt-1">
				{pending ? '登録中…' : 'アカウントを作成'}
			</Button>
		</form>
	);
}
