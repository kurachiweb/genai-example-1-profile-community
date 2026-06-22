'use client';

import { useState, useTransition } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, Input, Label } from '@app/frontend-lib';
import { withdrawAccountAction } from '@/lib/actions';

export function WithdrawSection() {
	const [confirm, setConfirm] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	function handleWithdraw(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const password = (
			event.currentTarget.elements.namedItem('withdrawPassword') as HTMLInputElement
		).value;
		setError(null);
		startTransition(async () => {
			const result = await withdrawAccountAction(password);
			if (!result.ok) {
				setError(result.error ?? '退会処理に失敗しました。');
			}
		});
	}

	return (
		<div className="rounded-xl border border-danger/30 bg-danger/5 p-6">
			<div className="flex items-start gap-3">
				<AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
				<div>
					<p className="font-semibold text-danger">アカウントを削除する</p>
					<p className="mt-1 text-[length:var(--text-meta)] text-text-muted">
						退会するとプロフィールと関連データはすべて削除され、元に戻せません。
					</p>
				</div>
			</div>

			{!confirm ? (
				<Button
					variant="outline"
					size="sm"
					className="mt-4 border-danger/40 text-danger hover:bg-danger/10"
					onClick={() => setConfirm(true)}
				>
					退会する
				</Button>
			) : (
				<form onSubmit={handleWithdraw} className="mt-4 space-y-3">
					{error ? (
						<p
							role="alert"
							className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[length:var(--text-meta)] text-danger"
						>
							{error}
						</p>
					) : null}

					<p className="text-[length:var(--text-meta)] text-text-muted">
						本当に退会しますか？確認のため現在のパスワードを入力してください。
					</p>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="withdrawPassword" required>
							パスワード
						</Label>
						<Input
							id="withdrawPassword"
							name="withdrawPassword"
							type="password"
							autoComplete="current-password"
							required
						/>
					</div>

					<div className="flex gap-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setConfirm(false)}
						>
							キャンセル
						</Button>
						<Button
							type="submit"
							size="sm"
							disabled={isPending}
							className="bg-danger text-white hover:opacity-90"
						>
							{isPending ? '処理中…' : '退会する'}
						</Button>
					</div>
				</form>
			)}
		</div>
	);
}
