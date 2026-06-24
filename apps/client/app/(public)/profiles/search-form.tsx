'use client';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@lib';

interface Props {
	readonly defaultValue?: string;
}

export function SearchForm({ defaultValue = '' }: Props) {
	const router = useRouter();

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const q = (form.elements.namedItem('q') as HTMLInputElement).value.trim();
		const params = new URLSearchParams();
		if (q) params.set('q', q);
		router.push(`/profiles?${params.toString()}`);
	}

	return (
		<form onSubmit={handleSubmit} role="search" className="mb-6 flex gap-2">
			<div className="relative flex-1">
				<Search
					className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-subtle"
					aria-hidden="true"
				/>
				<Input
					name="q"
					type="search"
					placeholder="名前・職業・自己紹介で検索…"
					defaultValue={defaultValue}
					className="pl-9"
					aria-label="プロフィールを検索"
				/>
			</div>
			<button
				type="submit"
				className="rounded-md bg-accent px-4 text-[length:var(--text-meta)] font-medium text-white hover:opacity-90"
			>
				検索
			</button>
		</form>
	);
}
