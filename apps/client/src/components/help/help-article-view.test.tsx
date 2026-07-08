import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { HelpArticleView } from './help-article-view';
import type { HelpArticle } from '@/lib/api/types';

function makeArticle(overrides: Partial<HelpArticle> = {}): HelpArticle {
	return {
		title: 'プロフィールの編集方法',
		slug: 'edit-profile',
		category: 'アカウント',
		bodyMarkdown: '本文です。',
		updatedAt: '2026-06-19T00:00:00Z',
		...overrides
	};
}

describe('HelpArticleView', () => {
	it('本文(マークダウン)とカテゴリ・更新日を表示する', () => {
		render(<HelpArticleView article={makeArticle()} />);

		expect(
			screen.getByRole('heading', { level: 1, name: 'プロフィールの編集方法' })
		).toBeInTheDocument();
		expect(screen.getByText('本文です。')).toBeInTheDocument();
		expect(screen.getByText('アカウント')).toBeInTheDocument();
	});

	it('カテゴリが無い場合はカテゴリ表示を省略する', () => {
		render(<HelpArticleView article={makeArticle({ category: null })} />);

		expect(screen.queryByText('アカウント')).not.toBeInTheDocument();
	});

	it('ヘルプ一覧への戻りリンクを表示する', () => {
		render(<HelpArticleView article={makeArticle()} />);

		expect(screen.getByRole('link', { name: /ヘルプ一覧に戻る/ })).toHaveAttribute(
			'href',
			'/helps'
		);
	});

	it('アクセシビリティ違反がない', async () => {
		const { container } = render(<HelpArticleView article={makeArticle()} />);

		expect(await axe(container)).toHaveNoViolations();
	});
});
