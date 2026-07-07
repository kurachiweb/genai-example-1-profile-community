// ヘルプ記事一覧ページ。ログイン不要(BR-CONTENT-005)。公開状態の記事のみカテゴリ別に表示する。
import type { Metadata } from 'next';
import { listPublishedHelpArticles } from '@/lib/api/client';
import { HelpArticleList } from '@/components/help/help-article-list';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
	title: 'ヘルプ',
	description: 'GenAI Profile Community の使い方やよくある質問をご案内します。'
};

export default async function HelpsPage() {
	const articles = await listPublishedHelpArticles();

	return (
		<div className="mx-auto max-w-3xl px-4 py-8">
			<PageHeader title="ヘルプ" description="使い方やよくある質問をカテゴリ別にご案内します。" />
			<HelpArticleList articles={articles} />
		</div>
	);
}
