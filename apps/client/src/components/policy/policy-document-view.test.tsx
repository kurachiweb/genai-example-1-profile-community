import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { PolicyDocumentView } from './policy-document-view';
import type { PolicyDocument } from '@/lib/api/types';

function makePolicy(overrides: Partial<PolicyDocument> = {}): PolicyDocument {
	return {
		type: 'terms',
		version: 2,
		bodyMarkdown: '本文です。',
		isPublished: true,
		requiresReconsent: false,
		effectiveDate: '2026-07-01T00:00:00Z',
		...overrides
	};
}

describe('PolicyDocumentView', () => {
	it('タイトルと本文(マークダウン)を表示する', () => {
		render(
			<PolicyDocumentView
				title="利用規約"
				policy={makePolicy()}
				versions={[makePolicy()]}
				basePath="/terms"
			/>
		);

		expect(screen.getByRole('heading', { level: 1, name: '利用規約' })).toBeInTheDocument();
		expect(screen.getByText('本文です。')).toBeInTheDocument();
		expect(screen.getByText(/第 2 版/)).toBeInTheDocument();
	});

	it('過去版バナーは現行版では表示しない', () => {
		render(
			<PolicyDocumentView
				title="利用規約"
				policy={makePolicy({ isPublished: true })}
				versions={[makePolicy()]}
				basePath="/terms"
			/>
		);

		expect(screen.queryByRole('status')).not.toBeInTheDocument();
	});

	it('過去版を表示している場合、最新版への案内を表示する', () => {
		render(
			<PolicyDocumentView
				title="利用規約"
				policy={makePolicy({ version: 1, isPublished: false })}
				versions={[makePolicy({ version: 1, isPublished: false }), makePolicy({ version: 2 })]}
				basePath="/terms"
			/>
		);

		expect(screen.getByRole('status')).toHaveTextContent('過去に発効していた版');
		expect(screen.getByRole('link', { name: /最新版を見る/ })).toHaveAttribute('href', '/terms');
	});

	it('現行版以外の版がある場合、改定履歴として一覧表示する', () => {
		render(
			<PolicyDocumentView
				title="利用規約"
				policy={makePolicy({ version: 2 })}
				versions={[makePolicy({ version: 1, isPublished: false }), makePolicy({ version: 2 })]}
				basePath="/terms"
			/>
		);

		expect(screen.getByRole('heading', { name: '改定履歴' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /第 1 版/ })).toHaveAttribute('href', '/terms/1');
	});

	it('現行版のみの場合、改定履歴セクションを表示しない', () => {
		render(
			<PolicyDocumentView
				title="利用規約"
				policy={makePolicy({ version: 1 })}
				versions={[makePolicy({ version: 1 })]}
				basePath="/terms"
			/>
		);

		expect(screen.queryByRole('heading', { name: '改定履歴' })).not.toBeInTheDocument();
	});

	it('アクセシビリティ違反がない', async () => {
		const { container } = render(
			<PolicyDocumentView
				title="利用規約"
				policy={makePolicy({ version: 1, isPublished: false })}
				versions={[makePolicy({ version: 1, isPublished: false }), makePolicy({ version: 2 })]}
				basePath="/terms"
			/>
		);

		expect(await axe(container)).toHaveNoViolations();
	});
});
