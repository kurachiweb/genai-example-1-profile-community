import { render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { HelpArticleList } from './help-article-list';
import type { HelpArticleSummary } from '@/lib/api/types';

function makeArticle(overrides: Partial<HelpArticleSummary> = {}): HelpArticleSummary {
	return {
		title: 'プロフィールの編集方法',
		slug: 'edit-profile',
		category: 'アカウント',
		updatedAt: '2026-06-19T00:00:00Z',
		...overrides
	};
}

describe('HelpArticleList', () => {
	it('記事が無い場合は空状態のメッセージを表示する', () => {
		render(<HelpArticleList articles={[]} />);

		expect(screen.getByText('まだ公開されているヘルプ記事がありません。')).toBeInTheDocument();
	});

	it('カテゴリ別に記事をグルーピングして見出しと一覧を表示する', () => {
		render(
			<HelpArticleList
				articles={[
					makeArticle({ slug: 'a', title: 'アカウント記事', category: 'アカウント' }),
					makeArticle({ slug: 'b', title: 'プロフィール記事', category: 'プロフィール' })
				]}
			/>
		);

		expect(screen.getByRole('heading', { name: 'アカウント' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'プロフィール' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /アカウント記事/ })).toHaveAttribute(
			'href',
			'/helps/a'
		);
		expect(screen.getByRole('link', { name: /プロフィール記事/ })).toHaveAttribute(
			'href',
			'/helps/b'
		);
	});

	it('カテゴリが無い記事は「その他」として一覧表示する', () => {
		render(<HelpArticleList articles={[makeArticle({ category: null })]} />);

		expect(screen.getByRole('heading', { name: 'その他' })).toBeInTheDocument();
	});

	it('同一カテゴリ内は渡された順序(更新日時降順)のまま表示する', () => {
		render(
			<HelpArticleList
				articles={[
					makeArticle({ slug: 'newer', title: '新しい記事', category: 'アカウント' }),
					makeArticle({ slug: 'older', title: '古い記事', category: 'アカウント' })
				]}
			/>
		);

		const section = screen.getByRole('heading', { name: 'アカウント' }).closest('section');
		const links = within(section as HTMLElement).getAllByRole('link');
		expect(links.map((link) => link.textContent)).toEqual([
			expect.stringContaining('新しい記事'),
			expect.stringContaining('古い記事')
		]);
	});

	it('アクセシビリティ違反がない', async () => {
		const { container } = render(
			<HelpArticleList
				articles={[
					makeArticle({ slug: 'a', category: 'アカウント' }),
					makeArticle({ slug: 'b', category: null })
				]}
			/>
		);

		expect(await axe(container)).toHaveNoViolations();
	});
});
