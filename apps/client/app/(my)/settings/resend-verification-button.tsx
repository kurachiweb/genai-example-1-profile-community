'use client';

import { useState, useTransition } from 'react';
import { Button } from '@lib';
import { resendVerificationEmailAction } from '@/lib/actions';

export function ResendVerificationButton() {
	const [isPending, startTransition] = useTransition();
	const [sent, setSent] = useState(false);

	function handleResend() {
		startTransition(async () => {
			const result = await resendVerificationEmailAction();
			if (result.ok) setSent(true);
		});
	}

	if (sent) {
		return (
			<p className="text-(length:--text-caption) text-success">
				確認メールを再送しました。受信トレイをご確認ください。
			</p>
		);
	}

	return (
		<Button variant="outline" size="sm" onClick={handleResend} disabled={isPending}>
			{isPending ? '送信中…' : '確認メールを再送する'}
		</Button>
	);
}
