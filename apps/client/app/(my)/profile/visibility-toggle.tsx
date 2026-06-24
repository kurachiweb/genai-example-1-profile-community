'use client';

import { useState, useTransition } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@lib';
import { setProfileVisibilityAction } from '@/lib/actions';
import type { ProfileVisibility } from '@/lib/api/types';

interface Props {
	readonly currentVisibility: ProfileVisibility;
	readonly isEmailVerified: boolean;
}

export function VisibilityToggle({ currentVisibility, isEmailVerified }: Props) {
	const [visibility, setVisibility] = useState<ProfileVisibility>(currentVisibility);
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);

	function toggle() {
		const next: ProfileVisibility = visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
		if (next === 'PUBLIC' && !isEmailVerified) {
			setError('メールアドレスを確認してからプロフィールを公開してください。');
			return;
		}
		setError(null);
		startTransition(async () => {
			const result = await setProfileVisibilityAction(next);
			if (result.ok) {
				setVisibility(next);
			} else {
				setError(result.error ?? '更新に失敗しました。');
			}
		});
	}

	return (
		<div className="rounded-xl border border-border bg-surface-raised p-4">
			{error ? (
				<p
					role="alert"
					className="mb-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[length:var(--text-meta)] text-danger"
				>
					{error}
				</p>
			) : null}
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					{visibility === 'PUBLIC' ? (
						<Eye className="size-5 text-accent" aria-hidden="true" />
					) : (
						<EyeOff className="size-5 text-text-subtle" aria-hidden="true" />
					)}
					<div>
						<p className="font-medium text-text">{visibility === 'PUBLIC' ? '公開中' : '非公開'}</p>
						<p className="text-[length:var(--text-caption)] text-text-muted">
							{visibility === 'PUBLIC'
								? '誰でもプロフィールを閲覧できます。'
								: 'プロフィールは一般には公開されていません。'}
						</p>
					</div>
				</div>
				<Button variant="outline" size="sm" onClick={toggle} disabled={isPending}>
					{isPending ? '更新中…' : visibility === 'PUBLIC' ? '非公開にする' : '公開する'}
				</Button>
			</div>
		</div>
	);
}
