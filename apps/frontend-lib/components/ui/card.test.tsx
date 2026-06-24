import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@lib/components/ui/card';

describe('Card', () => {
	test('見出しと本文を組んだ Bento タイルを描画する', () => {
		render(
			<Card>
				<CardHeader>
					<CardTitle>利用統計</CardTitle>
					<CardDescription>過去 30 日</CardDescription>
				</CardHeader>
				<CardContent>登録数 1,234</CardContent>
			</Card>
		);

		expect(screen.getByRole('heading', { name: '利用統計' })).toBeInTheDocument();
		expect(screen.getByText('過去 30 日')).toBeInTheDocument();
		expect(screen.getByText('登録数 1,234')).toBeInTheDocument();
	});

	test('CardTitle は as で見出しレベルを変えられる', () => {
		render(<CardTitle as="h2">セクション</CardTitle>);

		expect(screen.getByRole('heading', { level: 2, name: 'セクション' })).toBeInTheDocument();
	});

	test('elevation に応じた影クラスが付与される', () => {
		const { container } = render(<Card elevation={2}>tile</Card>);

		expect(container.firstChild).toHaveClass('shadow-e2');
	});

	test('アクセシビリティ違反がない', async () => {
		const { container } = render(
			<Card>
				<CardTitle>タイトル</CardTitle>
				<CardContent>内容</CardContent>
			</Card>
		);

		expect(await axe(container)).toHaveNoViolations();
	});
});
