import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@lib/components/ui/input';

describe('Input', () => {
	test('入力した値を反映する', async () => {
		const user = userEvent.setup();
		render(<Input aria-label="メールアドレス" />);

		const input = screen.getByLabelText('メールアドレス');
		await user.type(input, 'admin@example.com');

		expect(input).toHaveValue('admin@example.com');
	});

	test('aria-invalid を伝播する', () => {
		render(<Input aria-label="パスワード" aria-invalid />);

		expect(screen.getByLabelText('パスワード')).toHaveAttribute('aria-invalid', 'true');
	});

	test('disabled を反映する', () => {
		render(<Input aria-label="ハンドル" disabled />);

		expect(screen.getByLabelText('ハンドル')).toBeDisabled();
	});
});
