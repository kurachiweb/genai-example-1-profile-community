import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@lib/components/theme/theme-provider';

function ThemeProbe() {
	const { theme, resolvedTheme, setTheme } = useTheme();
	return (
		<div>
			<span data-testid="theme">{theme}</span>
			<span data-testid="resolved">{resolvedTheme}</span>
			<button type="button" onClick={() => setTheme('dark')}>
				ダーク
			</button>
			<button type="button" onClick={() => setTheme('light')}>
				ライト
			</button>
		</div>
	);
}

describe('ThemeProvider / useTheme', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.classList.remove('dark');
	});

	test('既定はライト解決（matchMedia スタブは非ダーク）', () => {
		render(
			<ThemeProvider>
				<ThemeProbe />
			</ThemeProvider>
		);

		expect(screen.getByTestId('resolved')).toHaveTextContent('light');
	});

	test('setTheme(dark) で html に .dark を付与し localStorage に永続化する', async () => {
		const user = userEvent.setup();
		render(
			<ThemeProvider>
				<ThemeProbe />
			</ThemeProvider>
		);

		await user.click(screen.getByRole('button', { name: 'ダーク' }));

		expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
		expect(document.documentElement).toHaveClass('dark');
		expect(localStorage.getItem('gpc-theme')).toBe('dark');
	});

	test('setTheme(light) で .dark を外す', async () => {
		const user = userEvent.setup();
		render(
			<ThemeProvider defaultTheme="dark">
				<ThemeProbe />
			</ThemeProvider>
		);

		await user.click(screen.getByRole('button', { name: 'ライト' }));

		expect(document.documentElement).not.toHaveClass('dark');
		expect(localStorage.getItem('gpc-theme')).toBe('light');
	});

	test('Provider 外で useTheme を呼ぶと例外', () => {
		// コンソールエラー抑制のため描画を try/catch で隔離する。
		const Broken = () => {
			useTheme();
			return null;
		};
		expect(() => render(<Broken />)).toThrow('ThemeProvider');
	});
});
