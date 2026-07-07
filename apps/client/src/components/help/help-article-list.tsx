// ヘルプ記事一覧のビュー(BR-CONTENT-005)。カテゴリ別にグルーピングして表示する。
// カテゴリ・記事の並び順は呼び出し側(api の publicHelpArticles、更新日時降順)にそのまま従う。
import Link from 'next/link';
import { formatDate } from '@lib';
import type { HelpArticleSummary } from '@/lib/api/types';

const UNCATEGORIZED_LABEL = 'その他';

interface Props {
	readonly articles: readonly HelpArticleSummary[];
}

function groupByCategory(
	articles: readonly HelpArticleSummary[]
): readonly [string, HelpArticleSummary[]][] {
	const groups = new Map<string, HelpArticleSummary[]>();
	for (const article of articles) {
		const category = article.category ?? UNCATEGORIZED_LABEL;
		const existing = groups.get(category);
		if (existing) {
			existing.push(article);
		} else {
			groups.set(category, [article]);
		}
	}
	return [...groups.entries()];
}

export function HelpArticleList({ articles }: Props) {
	if (articles.length === 0) {
		return (
			<p className="py-16 text-center text-(length:--text-body) text-text-muted">
				まだ公開されているヘルプ記事がありません。
			</p>
		);
	}

	const groups = groupByCategory(articles);

	return (
		<div className="space-y-10">
			{groups.map(([category, categoryArticles]) => (
				<section key={category}>
					<h2 className="text-(length:--text-subheading) font-semibold text-text">{category}</h2>
					<div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface-raised">
						<ul className="divide-y divide-border">
							{categoryArticles.map((article) => (
								<li key={article.slug}>
									<Link
										href={`/helps/${article.slug}`}
										className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface"
									>
										<span className="font-medium text-text group-hover:text-accent">
											{article.title}
										</span>
										<span className="shrink-0 text-(length:--text-caption) text-text-subtle">
											{formatDate(article.updatedAt)}
										</span>
									</Link>
								</li>
							))}
						</ul>
					</div>
				</section>
			))}
		</div>
	);
}
