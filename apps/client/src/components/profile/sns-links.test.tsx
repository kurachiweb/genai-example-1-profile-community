import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { SnsLinks } from './sns-links';
import type { SnsLink } from '@/lib/api/types';

const makeSnsLink = (overrides: Partial<SnsLink> = {}): SnsLink => ({
	id: 'link-1',
	platform: 'github',
	url: 'https://github.com/example',
	displayOrder: 0,
	...overrides
});

describe('SnsLinks', () => {
	it('リンクが 0 件のとき何も描画しない', () => {
		const { container } = render(<SnsLinks links={[]} />);
		expect(container.firstChild).toBeNull();
	});

	it('リンクを表示順でレンダリングする', () => {
		const links: SnsLink[] = [
			makeSnsLink({ id: '1', platform: 'github', displayOrder: 1 }),
			makeSnsLink({ id: '2', platform: 'website', url: 'https://example.com', displayOrder: 0 })
		];
		render(<SnsLinks links={links} />);
		const items = screen.getAllByRole('listitem');
		// displayOrder: 0 (website) が先に来る
		expect(items[0]).toHaveTextContent('Web サイト');
		expect(items[1]).toHaveTextContent('GitHub');
	});

	it('外部リンクに rel="noopener noreferrer" を付与する', () => {
		render(<SnsLinks links={[makeSnsLink()]} />);
		const link = screen.getByRole('link', { name: /GitHub/i });
		expect(link).toHaveAttribute('rel', 'noopener noreferrer');
		expect(link).toHaveAttribute('target', '_blank');
	});

	it('http/https 以外の URL は描画しない', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		render(<SnsLinks links={[makeSnsLink({ url: 'javascript:alert(1)' as any })]} />);
		expect(screen.queryByRole('link')).toBeNull();
	});

	it('アクセシビリティ違反がない', async () => {
		const { container } = render(
			<SnsLinks
				links={[
					makeSnsLink(),
					makeSnsLink({
						id: '2',
						platform: 'instagram',
						url: 'https://instagram.com/example',
						displayOrder: 1
					})
				]}
			/>
		);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
