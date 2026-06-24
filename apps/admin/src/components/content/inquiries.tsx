// 問い合わせの状態更新(クライアント、BR-CONTENT-007)。遷移は api がドメインで検証する。
'use client';

import { useTransition } from 'react';
import { Button, type ButtonProps } from '@lib';
import { updateInquiryStatusAction } from '@/lib/content-actions';

function StatusButton({
	id,
	status,
	label,
	variant
}: {
	id: string;
	status: string;
	label: string;
	variant: ButtonProps['variant'];
}) {
	const [pending, startTransition] = useTransition();
	return (
		<Button
			type="button"
			size="sm"
			variant={variant}
			disabled={pending}
			onClick={() =>
				startTransition(() => updateInquiryStatusAction(id, status).then(() => undefined))
			}
		>
			{label}
		</Button>
	);
}

export function InquiryStatusButtons({ id, status }: { id: string; status: string }) {
	return (
		<div className="flex flex-wrap justify-end gap-2">
			{status === 'OPEN' ? (
				<>
					<StatusButton id={id} status="IN_PROGRESS" label="対応中にする" variant="outline" />
					<StatusButton id={id} status="CLOSED" label="完了" variant="primary" />
				</>
			) : null}
			{status === 'IN_PROGRESS' ? (
				<>
					<StatusButton id={id} status="CLOSED" label="完了" variant="primary" />
					<StatusButton id={id} status="OPEN" label="差し戻し" variant="ghost" />
				</>
			) : null}
			{status === 'CLOSED' ? (
				<StatusButton id={id} status="OPEN" label="再開" variant="ghost" />
			) : null}
		</div>
	);
}
