// ヘルプ記事詳細ページ。ログイン不要(BR-CONTENT-005)。非公開記事・不在スラッグは 404。
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedHelpArticle } from '@/lib/api/client';
import { HelpArticleView } from '@/components/help/help-article-view';

interface Props {
	readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const article = await getPublishedHelpArticle(slug);
	return { title: article?.title ?? 'ヘルプ' };
}

export default async function HelpArticlePage({ params }: Props) {
	const { slug } = await params;
	const article = await getPublishedHelpArticle(slug);
	if (!article) notFound();

	return <HelpArticleView article={article} />;
}
