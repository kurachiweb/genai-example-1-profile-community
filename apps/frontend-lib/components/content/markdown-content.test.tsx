import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MarkdownContent } from './markdown-content';

describe('MarkdownContent', () => {
	test('見出し・段落・強調を意味のある要素として描画する', () => {
		render(<MarkdownContent markdown={'# 利用規約\n\nこれは**重要**な規定です。'} />);

		expect(screen.getByRole('heading', { level: 1, name: '利用規約' })).toBeInTheDocument();
		expect(screen.getByText('重要').tagName).toBe('STRONG');
	});

	test('箇条書きを ul/li として描画する', () => {
		render(<MarkdownContent markdown={'- 項目A\n- 項目B'} />);

		const list = screen.getByRole('list');
		expect(list.tagName).toBe('UL');
		expect(screen.getAllByRole('listitem')).toHaveLength(2);
	});

	test('安全なリンクは href 付きで描画される', () => {
		render(<MarkdownContent markdown={'[お問い合わせ](/inquiries)'} />);

		expect(screen.getByRole('link', { name: 'お問い合わせ' })).toHaveAttribute(
			'href',
			'/inquiries'
		);
	});

	test('危険なスキームのリンクはテキストのみになりリンクを生成しない(AC-CONTENT-002)', () => {
		render(<MarkdownContent markdown={'[クリック](javascript:alert(1))'} />);

		expect(screen.queryByRole('link')).not.toBeInTheDocument();
		expect(screen.getByText('クリック')).toBeInTheDocument();
	});

	test('生 HTML はエスケープされテキストとして表示される(dangerouslySetInnerHTML 不使用)', () => {
		render(<MarkdownContent markdown={'<script>alert(1)</script>'} />);

		expect(document.querySelector('script')).not.toBeInTheDocument();
		expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument();
	});

	test('アクセシビリティ違反がない', async () => {
		const { container } = render(
			<MarkdownContent markdown={'# 見出し\n\n本文と[リンク](https://example.com)。'} />
		);

		expect(await axe(container)).toHaveNoViolations();
	});
});
