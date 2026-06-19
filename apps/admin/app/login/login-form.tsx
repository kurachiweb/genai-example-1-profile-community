// ログインフォーム(クライアント)。Server Action を useActionState で呼び、保留状態とエラーを扱う。
'use client';

import { useActionState } from 'react';
import { Button, Input, Label } from '@app/frontend-lib';
import { loginAction, type LoginState } from '@/lib/auth/actions';

export function LoginForm() {
	const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

	return (
		<form action={formAction} className="flex flex-col gap-4" noValidate>
			<div>
				<h2 className="text-[length:var(--text-title)] font-semibold text-text">ログイン</h2>
				<p className="mt-1 text-[length:var(--text-meta)] text-text-muted">
					メールアドレスとパスワードを入力してください。
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
					autoComplete="current-password"
					required
				/>
			</div>

			<Button type="submit" disabled={pending} className="mt-2">
				{pending ? 'ログイン中…' : 'ログイン'}
			</Button>
		</form>
	);
}
