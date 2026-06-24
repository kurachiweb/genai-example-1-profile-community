'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button, Input, Label } from '@app/frontend-lib';
import { loginAction, type AuthState } from '@/lib/auth/actions';

interface Props {
	readonly next?: string;
}

export function LoginForm({ next }: Props) {
	const [state, formAction, pending] = useActionState<AuthState, FormData>(loginAction, {});

	return (
		<form action={formAction} className="flex flex-col gap-4" noValidate>
			<div>
				<h2 className="text-[length:var(--text-title)] font-semibold text-text">
					メールアドレスでログイン
				</h2>
			</div>

			{next ? <input type="hidden" name="next" value={next} /> : null}

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
				<div className="flex items-center justify-between">
					<Label htmlFor="password" required>
						パスワード
					</Label>
					<Link
						href="/reset-password"
						className="text-[length:var(--text-caption)] text-accent hover:underline"
					>
						パスワードを忘れた方
					</Link>
				</div>
				<Input
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					required
				/>
			</div>

			<Button type="submit" disabled={pending} className="mt-1">
				{pending ? 'ログイン中…' : 'ログイン'}
			</Button>
		</form>
	);
}
