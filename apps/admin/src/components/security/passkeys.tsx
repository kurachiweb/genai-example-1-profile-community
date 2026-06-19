// パスキー(WebAuthn)の登録・削除(クライアント)。秘密鍵は認証器内に留まる(BR-COMMON-016・AC-ADMIN-013)。
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Fingerprint } from 'lucide-react';
import { Button, Input, Label } from '@app/frontend-lib';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { deletePasskeyAction } from '@/lib/actions';
import { registerPasskey } from '@/lib/webauthn/client';

export function RegisterPasskeyButton() {
	const [nickname, setNickname] = useState('');
	const [pending, startTransition] = useTransition();
	const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
	const router = useRouter();

	function onRegister() {
		setMessage(null);
		startTransition(async () => {
			try {
				await registerPasskey(nickname.trim() || undefined);
				setMessage({ ok: true, text: 'パスキーを登録しました。' });
				setNickname('');
				router.refresh();
			} catch (error) {
				setMessage({
					ok: false,
					text: error instanceof Error ? error.message : 'パスキーの登録に失敗しました。'
				});
			}
		});
	}

	return (
		<div className="flex flex-wrap items-end gap-3">
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="passkey-nickname">表示名(任意)</Label>
				<Input
					id="passkey-nickname"
					value={nickname}
					onChange={(event) => setNickname(event.target.value)}
					maxLength={50}
					placeholder="例: YubiKey 5C"
					className="w-56"
				/>
			</div>
			<Button type="button" onClick={onRegister} disabled={pending}>
				<Fingerprint className="size-4" aria-hidden="true" />
				{pending ? '登録中…' : 'パスキーを登録'}
			</Button>
			{message ? (
				<p
					role="status"
					className={
						message.ok
							? 'text-[length:var(--text-meta)] text-success'
							: 'text-[length:var(--text-meta)] text-danger'
					}
				>
					{message.text}
				</p>
			) : null}
		</div>
	);
}

export function DeletePasskeyButton({ id }: { id: string }) {
	return (
		<ConfirmDialog
			triggerLabel="削除"
			triggerVariant="danger"
			triggerSize="sm"
			title="このパスキーを削除しますか？"
			description="この認証器でのログインができなくなります。メール＋パスワードでは引き続きログインできます。"
			confirmLabel="削除する"
			confirmVariant="danger"
			onConfirm={() => deletePasskeyAction(id)}
		/>
	);
}
