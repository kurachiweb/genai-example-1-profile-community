'use client';

import { useState, useTransition } from 'react';
import { Button, Input, Label } from '@lib';
import { updateProfileAction } from '@/lib/actions';
import type { MyProfile } from '@/lib/api/types';

interface Props {
	readonly profile: MyProfile;
}

export function ProfileForm({ profile }: Props) {
	const [isPending, startTransition] = useTransition();
	const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const getValue = (name: string) =>
			(form.elements.namedItem(name) as HTMLInputElement).value.trim() || undefined;

		setMessage(null);
		startTransition(async () => {
			const result = await updateProfileAction({
				handle: getValue('handle'),
				firstName: getValue('firstName'),
				lastName: getValue('lastName'),
				occupation: getValue('occupation'),
				bio: (form.elements.namedItem('bio') as HTMLTextAreaElement).value.trim() || undefined
			});
			setMessage({
				ok: result.ok,
				text: result.ok ? 'プロフィールを保存しました。' : (result.error ?? '保存に失敗しました。')
			});
		});
	}

	return (
		<form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface-raised p-6">
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

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="handle">ハンドル名（URL）</Label>
					<Input
						id="handle"
						name="handle"
						defaultValue={profile.handle ?? ''}
						placeholder="your-handle"
						pattern="^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$"
						maxLength={32}
					/>
					<p className="text-(length:--text-caption) text-text-subtle">
						英数字・ハイフン。公開 URL: /your-handle
					</p>
				</div>

				<div className="flex flex-col gap-1.5 sm:col-start-1">
					<Label htmlFor="lastName">姓</Label>
					<Input
						id="lastName"
						name="lastName"
						defaultValue={profile.lastName ?? ''}
						maxLength={64}
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<Label htmlFor="firstName">名</Label>
					<Input
						id="firstName"
						name="firstName"
						defaultValue={profile.firstName ?? ''}
						maxLength={64}
					/>
				</div>

				<div className="flex flex-col gap-1.5 sm:col-span-2">
					<Label htmlFor="occupation">職業・職種</Label>
					<Input
						id="occupation"
						name="occupation"
						defaultValue={profile.occupation ?? ''}
						maxLength={128}
						placeholder="例: ソフトウェアエンジニア"
					/>
				</div>

				<div className="flex flex-col gap-1.5 sm:col-span-2">
					<Label htmlFor="bio">自己紹介</Label>
					<textarea
						id="bio"
						name="bio"
						defaultValue={profile.bio ?? ''}
						rows={4}
						maxLength={500}
						className="w-full rounded-md border border-border bg-surface px-3 py-2 text-(length:--text-meta) text-text placeholder:text-text-subtle focus:border-accent focus:outline-none"
						placeholder="あなた自身について書いてください（最大 500 文字）"
					/>
				</div>
			</div>

			<div className="mt-4 flex justify-end">
				<Button type="submit" disabled={isPending}>
					{isPending ? '保存中…' : '保存する'}
				</Button>
			</div>
		</form>
	);
}
