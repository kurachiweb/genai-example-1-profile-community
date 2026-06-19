// API キー運用の操作(クライアント)。失効・しきい値変更はともに確認ダイアログ＋監査明示(BR-ADMIN-003/007/008)。
'use client';

import { useState } from 'react';
import { Ban, SlidersHorizontal } from 'lucide-react';
import { Input, Label } from '@app/frontend-lib';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { revokeApiKeyAction, setRateLimitAction } from '@/lib/actions';

export function RevokeKeyButton({ keyId }: { keyId: string }) {
	return (
		<ConfirmDialog
			triggerLabel="失効"
			triggerVariant="danger"
			triggerSize="sm"
			triggerIcon={<Ban className="size-4" aria-hidden="true" />}
			title="この API キーを失効しますか？"
			description="失効すると以後このキーでの API 利用ができなくなり、所有ユーザーに影響します。"
			confirmLabel="失効する"
			confirmVariant="danger"
			onConfirm={() => revokeApiKeyAction(keyId)}
		/>
	);
}

export function RateLimitControl({ current }: { current: number }) {
	const [value, setValue] = useState(String(current));
	const parsed = Number(value);
	const valid = Number.isInteger(parsed) && parsed >= 1;
	return (
		<ConfirmDialog
			triggerLabel="しきい値を変更"
			triggerVariant="outline"
			triggerSize="md"
			triggerIcon={<SlidersHorizontal className="size-4" aria-hidden="true" />}
			title="共通レート制限を変更しますか？"
			description="全 API キー共通の 1 分あたりリクエスト数です。本番のエッジ(Cloudflare WAF)閾値は別途 Terraform で整合させます。"
			confirmLabel="変更する"
			confirmVariant="primary"
			onConfirm={() =>
				valid
					? setRateLimitAction(parsed)
					: Promise.resolve({ ok: false, error: '1 以上の整数で入力してください。' })
			}
		>
			<Label htmlFor="rate-limit">リクエスト / 分</Label>
			<Input
				id="rate-limit"
				type="number"
				min={1}
				value={value}
				onChange={(event) => setValue(event.target.value)}
				className="mt-1.5 w-40"
				aria-invalid={!valid}
			/>
		</ConfirmDialog>
	);
}
