import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ProfileCard } from './profile-card';
import type { PublicProfileSummary } from '@/lib/api/types';

const makeProfile = (overrides: Partial<PublicProfileSummary> = {}): PublicProfileSummary => ({
	handle: 'alice',
	firstName: 'Alice',
	lastName: null,
	occupation: 'エンジニア',
	bio: null,
	iconUrl: null,
	...overrides
});

describe('ProfileCard', () => {
	it('名前と職業を表示する', () => {
		render(<ProfileCard profile={makeProfile()} />);
		expect(screen.getByText('Alice')).toBeInTheDocument();
		expect(screen.getByText('エンジニア')).toBeInTheDocument();
	});

	it('アイコンがない場合にプレースホルダーを表示する', () => {
		render(<ProfileCard profile={makeProfile({ iconUrl: null })} />);
		// aria-hidden のアイコン div が存在する(img は表示されない)
		expect(screen.queryByRole('img')).toBeNull();
	});

	it('ハンドル名を href に使用する', () => {
		render(<ProfileCard profile={makeProfile()} />);
		expect(screen.getByRole('link')).toHaveAttribute('href', '/alice');
	});

	it('bio が設定されている場合に表示する', () => {
		render(<ProfileCard profile={makeProfile({ bio: '自己紹介テキスト' })} />);
		expect(screen.getByText('自己紹介テキスト')).toBeInTheDocument();
	});

	it('アクセシビリティ違反がない', async () => {
		const { container } = render(<ProfileCard profile={makeProfile()} />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
