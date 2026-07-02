'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button, Input, Label } from '@lib';
import { createApiKeyAction } from '@/lib/actions';

export function CreateApiKeyButton() {
	const [open, setOpen] = useState(false);
	const [rawKey, setRawKey] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	function handleCreate(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const label = (form.elements.namedItem('label') as HTMLInputElement).value.trim();
		const scope = (form.elements.namedItem('scope') as HTMLSelectElement).value;

		setError(null);
		startTransition(async () => {
			const result = await createApiKeyAction(label, scope);
			if (result.ok && result.rawKey) {
				setRawKey(result.rawKey);
				router.refresh();
			} else {
				setError(result.error ?? 'キーの発行に失敗しました。');
			}
		});
	}

	function handleClose() {
		setOpen(false);
		setRawKey(null);
		setError(null);
	}

	return (
		<>
			<Button size="sm" onClick={() => setOpen(true)}>
				<Plus className="size-4" aria-hidden="true" />
				キーを発行
			</Button>

			{open ? (
				<div
					role="dialog"
					aria-modal="true"
					aria-label="API キーを発行"
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
				>
					<div className="w-full max-w-sm rounded-xl border border-border bg-surface-raised p-6 shadow-e3">
						<h2 className="text-(length:--text-title) font-semibold text-text">API キーを発行</h2>

						{rawKey ? (
							<div className="mt-4 space-y-3">
								<div
									role="alert"
									className="rounded-md border border-warning/40 bg-warning/10 p-3 text-(length:--text-caption) text-warning"
								>
									このキーは一度しか表示されません。必ずコピーして保管してください。
								</div>
								<code className="block w-full rounded-md border border-border bg-surface p-3 text-(length:--text-caption) break-all text-text">
									{rawKey}
								</code>
								<Button onClick={handleClose} className="w-full">
									閉じる
								</Button>
							</div>
						) : (
							<form onSubmit={handleCreate} className="mt-4 space-y-4">
								{error ? (
									<p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-(length:--text-meta) text-danger">
										{error}
									</p>
								) : null}

								<div className="flex flex-col gap-1.5">
									<Label htmlFor="keyLabel" required>
										ラベル
									</Label>
									<Input
										id="keyLabel"
										name="label"
										required
										maxLength={50}
										placeholder="例: GitHub Actions"
									/>
								</div>

								<div className="flex flex-col gap-1.5">
									<Label htmlFor="keyScope" required>
										スコープ
									</Label>
									<select
										id="keyScope"
										name="scope"
										className="w-full rounded-md border border-border bg-surface px-3 py-2 text-(length:--text-meta) text-text focus:border-accent focus:outline-none"
									>
										<option value="read">read — 読み取り専用</option>
										<option value="full">full — 読み書き</option>
									</select>
								</div>

								<div className="flex justify-end gap-2">
									<Button type="button" variant="ghost" size="sm" onClick={handleClose}>
										キャンセル
									</Button>
									<Button type="submit" size="sm" disabled={isPending}>
										{isPending ? '発行中…' : '発行する'}
									</Button>
								</div>
							</form>
						)}
					</div>
				</div>
			) : null}
		</>
	);
}
