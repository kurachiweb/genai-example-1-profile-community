'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input } from '@lib';
import { setSnsLinksAction } from '@/lib/actions';
import type { SnsLink, SnsLinkPlatform } from '@/lib/api/types';
import { snsLinkPlatformLabel } from '@/lib/i18n/labels';

const PLATFORMS: SnsLinkPlatform[] = [
	'X',
	'INSTAGRAM',
	'FACEBOOK',
	'LINKEDIN',
	'GITHUB',
	'YOUTUBE',
	'TIKTOK',
	'WEBSITE'
];

interface LinkEntry {
	id: string;
	platform: SnsLinkPlatform;
	url: string;
	displayOrder: number;
}

interface Props {
	readonly snsLinks: readonly SnsLink[];
}

export function SnsLinksForm({ snsLinks }: Props) {
	const [links, setLinks] = useState<LinkEntry[]>(
		snsLinks.map((l) => ({ ...l, platform: l.platform as SnsLinkPlatform }))
	);
	const [isPending, startTransition] = useTransition();
	const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

	function addLink() {
		setLinks((prev) => [
			...prev,
			{
				id: `new-${Date.now()}`,
				platform: 'WEBSITE' as SnsLinkPlatform,
				url: '',
				displayOrder: prev.length
			}
		]);
	}

	function removeLink(id: string) {
		setLinks((prev) => prev.filter((l) => l.id !== id));
	}

	function updateLink(id: string, field: 'platform' | 'url', value: string) {
		setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
	}

	function handleSave() {
		setMessage(null);
		startTransition(async () => {
			const result = await setSnsLinksAction(
				links
					.filter((l) => l.url.trim())
					.map((l, idx) => ({ platform: l.platform, url: l.url.trim(), displayOrder: idx }))
			);
			setMessage({
				ok: result.ok,
				text: result.ok ? 'SNS リンクを保存しました。' : (result.error ?? '保存に失敗しました。')
			});
		});
	}

	return (
		<div className="rounded-xl border border-border bg-surface-raised p-6">
			{message ? (
				<p
					role="alert"
					className={`mb-4 rounded-md px-3 py-2 text-(length:--text-meta) ${
						message.ok
							? 'border border-success/40 bg-success/10 text-success'
							: 'border border-danger/40 bg-danger/10 text-danger'
					}`}
				>
					{message.text}
				</p>
			) : null}

			<ul className="space-y-3">
				{links.map((link) => (
					<li key={link.id} className="flex items-center gap-2">
						<select
							value={link.platform}
							onChange={(e) => updateLink(link.id, 'platform', e.target.value)}
							className="w-36 shrink-0 rounded-md border border-border bg-surface p-2 text-(length:--text-caption) text-text focus:border-accent focus:outline-none"
							aria-label="プラットフォーム"
						>
							{PLATFORMS.map((p) => (
								<option key={p} value={p}>
									{snsLinkPlatformLabel(p)}
								</option>
							))}
						</select>
						<Input
							value={link.url}
							onChange={(e) => updateLink(link.id, 'url', e.target.value)}
							type="url"
							placeholder="https://..."
							className="flex-1"
							aria-label="URL"
						/>
						<button
							type="button"
							onClick={() => removeLink(link.id)}
							className="shrink-0 rounded-md p-2 text-text-subtle hover:bg-surface hover:text-danger"
							aria-label="このリンクを削除"
						>
							<Trash2 className="size-4" aria-hidden="true" />
						</button>
					</li>
				))}
			</ul>

			<div className="mt-3 flex items-center justify-between">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={addLink}
					disabled={links.length >= 10}
				>
					<Plus className="size-4" aria-hidden="true" />
					リンクを追加
				</Button>
				<Button onClick={handleSave} disabled={isPending} size="sm">
					{isPending ? '保存中…' : '保存する'}
				</Button>
			</div>
		</div>
	);
}
