// モデレーション操作ボタン群(クライアント)。ConfirmDialog で確認を挟み、Server Action を呼ぶ。
// 破壊的・重要操作は確認＋監査明示(design/03 §10・BR-ADMIN-003)。
'use client';

import { useState } from 'react';
import { CheckCircle2, ImageOff, Snowflake, Unlock, XCircle } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
	deleteIconAction,
	freezeUserAction,
	reviewReportAction,
	reviewUnfreezeAction
} from '@/lib/actions';

const FREEZE_REASONS: ReadonlyArray<readonly [string, string]> = [
	['spam', 'スパム'],
	['inappropriate_image', '不適切な画像'],
	['harassment', '嫌がらせ・ハラスメント'],
	['impersonation', 'なりすまし'],
	['other', 'その他']
];

export function FreezeUserButton({ userId }: { userId: string }) {
	const [reason, setReason] = useState('spam');
	return (
		<ConfirmDialog
			triggerLabel="凍結する"
			triggerVariant="danger"
			triggerIcon={<Snowflake className="size-4" aria-hidden="true" />}
			title="このユーザーを凍結しますか？"
			description="凍結すると公開が停止し、発行済み API キーが失効します。解除リクエストで復帰できます。"
			confirmLabel="凍結する"
			confirmVariant="danger"
			onConfirm={() => freezeUserAction(userId, reason)}
		>
			<label className="flex flex-col gap-1.5 text-(length:--text-meta)">
				<span className="font-medium text-text">理由区分</span>
				<select
					value={reason}
					onChange={(event) => setReason(event.target.value)}
					className="h-10 rounded-md border border-border bg-surface-raised px-3 text-text outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-focus-ring"
				>
					{FREEZE_REASONS.map(([value, label]) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</select>
			</label>
		</ConfirmDialog>
	);
}

export function DeleteIconButton({ userId }: { userId: string }) {
	return (
		<ConfirmDialog
			triggerLabel="アイコン削除"
			triggerVariant="outline"
			triggerIcon={<ImageOff className="size-4" aria-hidden="true" />}
			title="アイコンを削除しますか？"
			description="不適切なアイコンを既定に戻します。"
			confirmLabel="削除する"
			confirmVariant="danger"
			onConfirm={() => deleteIconAction(userId)}
		/>
	);
}

export function ReportDecisionButtons({ reportId }: { reportId: string }) {
	return (
		<div className="flex flex-wrap gap-2">
			<ConfirmDialog
				triggerLabel="対応済みにする"
				triggerVariant="primary"
				triggerIcon={<CheckCircle2 className="size-4" aria-hidden="true" />}
				title="通報を対応済みにしますか？"
				confirmLabel="対応済み"
				confirmVariant="primary"
				onConfirm={() => reviewReportAction(reportId, 'RESOLVED')}
			/>
			<ConfirmDialog
				triggerLabel="却下"
				triggerVariant="ghost"
				triggerIcon={<XCircle className="size-4" aria-hidden="true" />}
				title="通報を却下しますか？"
				confirmLabel="却下する"
				confirmVariant="outline"
				onConfirm={() => reviewReportAction(reportId, 'DISMISSED')}
			/>
		</div>
	);
}

export function UnfreezeDecisionButtons({ requestId }: { requestId: string }) {
	return (
		<div className="flex flex-wrap gap-2">
			<ConfirmDialog
				triggerLabel="承認(解除)"
				triggerVariant="primary"
				triggerIcon={<Unlock className="size-4" aria-hidden="true" />}
				title="解除リクエストを承認しますか？"
				description="ユーザーを有効(ACTIVE)に戻し、凍結前の公開設定で復帰させます。"
				confirmLabel="承認する"
				confirmVariant="primary"
				onConfirm={() => reviewUnfreezeAction(requestId, true)}
			/>
			<ConfirmDialog
				triggerLabel="却下"
				triggerVariant="ghost"
				triggerIcon={<XCircle className="size-4" aria-hidden="true" />}
				title="解除リクエストを却下しますか？"
				confirmLabel="却下する"
				confirmVariant="outline"
				onConfirm={() => reviewUnfreezeAction(requestId, false)}
			/>
		</div>
	);
}
