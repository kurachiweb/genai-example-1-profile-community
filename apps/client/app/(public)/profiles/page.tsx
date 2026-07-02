// プロフィール一覧・検索ページ。ログイン不要で閲覧できる(US-0403、US-0404)。
import type { Metadata } from 'next';
import { listPublicProfiles } from '@/lib/api/client';
import { ProfileCard } from '@/components/profile/profile-card';
import { PageHeader } from '@/components/ui/page-header';
import { SearchForm } from './search-form';

export const metadata: Metadata = {
	title: 'プロフィール一覧'
};

const PAGE_SIZE = 20;

interface Props {
	readonly searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function ProfilesPage({ searchParams }: Props) {
	const { q = '', page = '1' } = await searchParams;
	const currentPage = Math.max(1, parseInt(page, 10) || 1);
	const offset = (currentPage - 1) * PAGE_SIZE;

	const { profiles, total } = await listPublicProfiles({
		search: q || undefined,
		limit: PAGE_SIZE,
		offset
	});

	const totalPages = Math.ceil(total / PAGE_SIZE);

	return (
		<div className="mx-auto max-w-5xl px-4 py-8">
			<PageHeader
				title="プロフィール一覧"
				description="公開中のプロフィールを検索・閲覧できます。"
			/>

			<SearchForm defaultValue={q} />

			{q ? (
				<p className="mb-4 text-(length:--text-meta) text-text-muted">
					「{q}」の検索結果: {total} 件
				</p>
			) : (
				<p className="mb-4 text-(length:--text-meta) text-text-muted">{total} 件のプロフィール</p>
			)}

			{profiles.length === 0 ? (
				<div className="py-16 text-center text-(length:--text-body) text-text-muted">
					{q
						? `「${q}」に一致するプロフィールが見つかりませんでした。`
						: 'まだ公開プロフィールがありません。'}
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{profiles.map((profile) => (
						<ProfileCard key={profile.handle} profile={profile} />
					))}
				</div>
			)}

			{totalPages > 1 ? (
				<nav aria-label="ページネーション" className="mt-8 flex justify-center gap-2">
					{currentPage > 1 ? (
						<a
							href={`/profiles?q=${encodeURIComponent(q)}&page=${currentPage - 1}`}
							className="rounded-md border border-border px-3 py-1.5 text-(length:--text-meta) text-text-muted hover:bg-surface-raised"
						>
							前へ
						</a>
					) : null}
					<span className="rounded-md border border-accent bg-accent/8 px-3 py-1.5 text-(length:--text-meta) font-medium text-accent">
						{currentPage} / {totalPages}
					</span>
					{currentPage < totalPages ? (
						<a
							href={`/profiles?q=${encodeURIComponent(q)}&page=${currentPage + 1}`}
							className="rounded-md border border-border px-3 py-1.5 text-(length:--text-meta) text-text-muted hover:bg-surface-raised"
						>
							次へ
						</a>
					) : null}
				</nav>
			) : null}
		</div>
	);
}
