'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@lib';
import { reportProfileAction } from '@/lib/actions';

interface Props {
	readonly handle: string;
}

const REASON_OPTIONS = [
	{ value: 'INAPPROPRIATE_IMAGE', label: '不適切なコンテンツ' },
	{ value: 'SPAM', label: 'スパム' },
	{ value: 'HARASSMENT', label: '嫌がらせ・ハラスメント' },
	{ value: 'IMPERSONATION', label: 'なりすまし' },
	{ value: 'OTHER', label: 'その他' }
];

export function ReportButton({ handle }: Props) {
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState('');
	const [detail, setDetail] = useState('');
	const [status, setStatus] = useState<'idle' | 'pending' | 'done' | 'error'>('idle');

	async function handleReport() {
		if (!reason) return;
		setStatus('pending');
		const result = await reportProfileAction(handle, reason, detail || undefined);
		setStatus(result.ok ? 'done' : 'error');
	}

	if (status === 'done') {
		return (
			<p className="text-(length:--text-caption) text-text-subtle">
				通報を受け付けました。ご協力ありがとうございます。
			</p>
		);
	}

	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setOpen(!open)}
				aria-expanded={open}
				className="text-text-subtle"
			>
				<Flag className="size-3.5" aria-hidden="true" />
				通報する
			</Button>

			{open ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<button
						type="button"
						className="absolute inset-0 bg-black/40"
						onClick={() => setOpen(false)}
						aria-label="閉じる"
					/>
					<div
						role="dialog"
						aria-modal="true"
						aria-label="プロフィールを通報"
						className="relative w-full max-w-sm rounded-xl border border-border bg-surface-raised p-6 shadow-e3"
					>
						<h2 className="text-(length:--text-title) font-semibold text-text">
							プロフィールを通報
						</h2>

						{status === 'error' ? (
							<p className="mt-2 text-(length:--text-caption) text-danger">
								送信に失敗しました。もう一度お試しください。
							</p>
						) : null}

						<div className="mt-4 flex flex-col gap-3">
							<div>
								<label htmlFor="reason" className="text-(length:--text-meta) font-medium text-text">
									理由
								</label>
								<select
									id="reason"
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-(length:--text-meta) text-text focus:border-accent focus:outline-none"
								>
									<option value="">選択してください</option>
									{REASON_OPTIONS.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>

							<div>
								<label htmlFor="detail" className="text-(length:--text-meta) font-medium text-text">
									詳細（任意）
								</label>
								<textarea
									id="detail"
									value={detail}
									onChange={(e) => setDetail(e.target.value)}
									rows={3}
									maxLength={500}
									className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-(length:--text-meta) text-text placeholder:text-text-subtle focus:border-accent focus:outline-none"
									placeholder="具体的な内容があれば記入してください"
								/>
							</div>
						</div>

						<div className="mt-4 flex justify-end gap-2">
							<Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
								キャンセル
							</Button>
							<Button size="sm" onClick={handleReport} disabled={!reason || status === 'pending'}>
								{status === 'pending' ? '送信中…' : '通報する'}
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
