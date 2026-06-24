import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Button } from '@lib/components/ui/button';

describe('Button', () => {
	test('ラベルを持つボタンとして描画される', () => {
		render(<Button>保存</Button>);

		expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
	});

	test('既定の type は button（フォーム誤送信を防ぐ）', () => {
		render(<Button>操作</Button>);

		expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
	});

	test('クリックでハンドラが呼ばれる', async () => {
		// リポジトリ方針に合わせ、jest.fn ではなく手書きのカウンタで検証する。
		let clicks = 0;
		const user = userEvent.setup();
		render(<Button onClick={() => (clicks += 1)}>凍結</Button>);

		await user.click(screen.getByRole('button', { name: '凍結' }));

		expect(clicks).toBe(1);
	});

	test('disabled のときはクリックされない', async () => {
		let clicks = 0;
		const user = userEvent.setup();
		render(
			<Button disabled onClick={() => (clicks += 1)}>
				送信
			</Button>
		);

		await user.click(screen.getByRole('button', { name: '送信' }));

		expect(clicks).toBe(0);
		expect(screen.getByRole('button')).toBeDisabled();
	});

	test('asChild で子要素（リンク）へ装いを委譲する', () => {
		render(
			<Button asChild>
				<a href="/admin/users">ユーザー一覧</a>
			</Button>
		);

		const link = screen.getByRole('link', { name: 'ユーザー一覧' });
		expect(link).toHaveAttribute('href', '/admin/users');
	});

	test('variant / size のクラスが付与される', () => {
		render(
			<Button variant="danger" size="sm">
				削除
			</Button>
		);

		const button = screen.getByRole('button', { name: '削除' });
		expect(button.className).toContain('bg-danger');
		expect(button.className).toContain('h-8');
	});

	test('アクセシビリティ違反がない', async () => {
		const { container } = render(<Button>保存</Button>);

		const results = await axe(container);

		expect(results).toHaveNoViolations();
	});
});
