// ヘルプ記事詳細のビュー(BR-CONTENT-005)。
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge, formatDate, MarkdownContent } from '@lib';
import type { HelpArticle } from '@/lib/api/types';

interface Props {
	readonly article: HelpArticle;
}

export function HelpArticleView({ article }: Props) {
	return (
		<article className="mx-auto max-w-3xl px-4 py-12">
			<header className="mb-8 border-b border-border pb-6">
				<h1 className="mb-3 text-(length:--text-title) font-bold text-text">{article.title}</h1>
				<div className="flex items-center gap-3">
					{article.category ? <Badge tone="accent">{article.category}</Badge> : null}
					<p className="text-(length:--text-meta) text-text-muted">
						更新日 {formatDate(article.updatedAt)}
					</p>
				</div>
			</header>

			<MarkdownContent markdown={article.bodyMarkdown} />

			<footer className="mt-12 border-t border-border pt-6">
				<Link
					href="/helps"
					className="inline-flex items-center gap-1.5 text-(length:--text-meta) text-accent underline-offset-2 hover:underline"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					ヘルプ一覧に戻る
				</Link>
			</footer>
		</article>
	);
}
