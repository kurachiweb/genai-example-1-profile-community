// ログインフォーム(クライアント)。メール＋パスワード(Server Action)とパスキー認証の両方を提供する。
'use client';

import { useActionState, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Fingerprint } from 'lucide-react';
import { Button, Input, Label } from '@app/frontend-lib';
import { loginAction, type LoginState } from '@/lib/auth/actions';
import { loginWithPasskey } from '@/lib/webauthn/client';

export function LoginForm() {
	const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});
	const [email, setEmail] = useState('');
	const [passkeyPending, startPasskey] = useTransition();
	const [passkeyError, setPasskeyError] = useState<string | null>(null);
	const router = useRouter();

	function onPasskey() {
		setPasskeyError(null);
		if (!email) {
			setPasskeyError('パスキーで続行するにはメールアドレスを入力してください。');
			return;
		}
		startPasskey(async () => {
			try {
				await loginWithPasskey(email);
				router.replace('/');
				router.refresh();
			} catch (error) {
				setPasskeyError(error instanceof Error ? error.message : 'パスキー認証に失敗しました。');
			}
		});
	}

	return (
		<form action={formAction} className="flex flex-col gap-4" noValidate>
			<div>
				<h2 className="text-[length:var(--text-title)] font-semibold text-text">ログイン</h2>
				<p className="mt-1 text-[length:var(--text-meta)] text-text-muted">
					メールアドレスとパスワード、またはパスキーでログインします。
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
				<Input
					id="email"
					name="email"
					type="email"
					autoComplete="username webauthn"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					required
				/>
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

			<Button type="submit" disabled={pending} className="mt-1">
				{pending ? 'ログイン中…' : 'ログイン'}
			</Button>

			<div className="flex items-center gap-3 text-[length:var(--text-caption)] text-text-subtle">
				<span className="h-px flex-1 bg-border" />
				または
				<span className="h-px flex-1 bg-border" />
			</div>

			{passkeyError ? (
				<p
					role="alert"
					className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[length:var(--text-meta)] text-danger"
				>
					{passkeyError}
				</p>
			) : null}

			<Button type="button" variant="outline" onClick={onPasskey} disabled={passkeyPending}>
				<Fingerprint className="size-4" aria-hidden="true" />
				{passkeyPending ? '認証中…' : 'パスキーで続行'}
			</Button>
		</form>
	);
}
