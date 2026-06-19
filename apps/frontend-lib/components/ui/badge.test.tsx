import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
	test('内容を描画する', () => {
		render(<Badge>凍結中</Badge>);

		expect(screen.getByText('凍結中')).toBeInTheDocument();
	});

	test('tone に応じたクラスが付与される', () => {
		render(<Badge tone="danger">FROZEN</Badge>);

		expect(screen.getByText('FROZEN').className).toContain('bg-danger');
	});

	test('既定 tone は neutral', () => {
		render(<Badge>ACTIVE</Badge>);

		expect(screen.getByText('ACTIVE').className).toContain('bg-surface-sunken');
	});

	test('アクセシビリティ違反がない', async () => {
		const { container } = render(<Badge tone="success">公開中</Badge>);

		expect(await axe(container)).toHaveNoViolations();
	});
});
