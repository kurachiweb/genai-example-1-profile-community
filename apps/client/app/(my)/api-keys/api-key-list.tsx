'use client';

import { useState, useTransition } from 'react';
import { KeyRound, Trash2 } from 'lucide-react';
import { Button, Badge, formatRelativeTime } from '@app/frontend-lib';
import { revokeApiKeyAction } from '@/lib/actions';
import type { ApiKey } from '@/lib/api/types';

interface Props {
	readonly keys: readonly ApiKey[];
}

export function ApiKeyList({ keys }: Props) {
	const [revokedIds, setRevokedIds] = useState<Set<string>>(new Set());
	const [isPending, startTransition] = useTransition();

	function revoke(keyId: string) {
		startTransition(async () => {
			const result = await revokeApiKeyAction(keyId);
			if (result.ok) {
				setRevokedIds((prev) => new Set([...prev, keyId]));
			}
		});
	}

	const activeKeys = keys.filter(
		(k) => k.status === 'ACTIVE' && !revokedIds.has(k.id)
	);

	if (activeKeys.length === 0) {
		return (
			<div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface-raised py-12 text-center">
				<KeyRound className="size-8 text-text-subtle" aria-hidden="true" />
				<p className="text-[length:var(--text-body)] text-text-muted">
					有効な API キーがありません。
				</p>
				<p className="text-[length:var(--text-caption)] text-text-subtle">
					「キーを発行」ボタンから新しいキーを作成できます。
				</p>
			</div>
		);
	}

	return (
		<ul className="divide-y divide-border rounded-xl border border-border bg-surface-raised">
			{activeKeys.map((key) => (
				<li key={key.id} className="flex items-center gap-3 px-5 py-4">
					<KeyRound className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<span className="font-medium text-text">
								{key.label ?? '(ラベルなし)'}
							</span>
							<Badge variant={key.scope === 'full' ? 'destructive' : 'secondary'}>
								{key.scope}
							</Badge>
						</div>
						<p className="mt-0.5 text-[length:var(--text-caption)] text-text-subtle">
							作成日: {formatRelativeTime(key.createdAt)}
							{key.lastUsedAt ? ` · 最終使用: ${formatRelativeTime(key.lastUsedAt)}` : ''}
						</p>
					</div>
					<button
						type="button"
						onClick={() => revoke(key.id)}
						disabled={isPending}
						className="shrink-0 rounded-md p-2 text-text-subtle hover:bg-danger/10 hover:text-danger disabled:opacity-50"
						aria-label={`${key.label ?? 'このキー'} を失効させる`}
					>
						<Trash2 className="size-4" aria-hidden="true" />
					</button>
				</li>
			))}
		</ul>
	);
}
