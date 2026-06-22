'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@app/frontend-lib';

interface Props {
	readonly handle: string;
}

export function ShareSection({ handle }: Props) {
	const [copied, setCopied] = useState(false);
	const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
	const profileUrl = `${baseUrl}/${handle}`;

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(profileUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// クリップボードアクセス不可の場合は無視。
		}
	}

	return (
		<div className="rounded-xl border border-border bg-accent/5 p-4">
			<p className="text-[length:var(--text-caption)] font-medium text-text-muted mb-2">
				あなたの公開 URL
			</p>
			<div className="flex items-center gap-2">
				<code className="flex-1 truncate rounded-md border border-border bg-surface px-3 py-2 text-[length:var(--text-meta)] text-text">
					/{handle}
				</code>
				<Button variant="outline" size="sm" onClick={handleCopy} aria-label="URL をコピー">
					{copied ? (
						<Check className="size-4 text-success" aria-hidden="true" />
					) : (
						<Copy className="size-4" aria-hidden="true" />
					)}
				</Button>
				<Link href={`/${handle}`} target="_blank" rel="noopener noreferrer">
					<Button variant="outline" size="sm" aria-label="プロフィールを開く">
						<ExternalLink className="size-4" aria-hidden="true" />
					</Button>
				</Link>
			</div>
		</div>
	);
}
