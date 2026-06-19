// テーマ Provider と useTheme フック。低頻度更新の横断状態のため Context が適切（hooks 規約）。
// 役割トークン（tokens.css）を `.dark` クラスで差し替えるため、DOM への同期は effect で行う。
'use client';

import * as React from 'react';
import {
	isTheme,
	resolveTheme,
	THEME_STORAGE_KEY,
	type ResolvedTheme,
	type Theme
} from '@/utilities/theme';

interface ThemeContextValue {
	readonly theme: Theme;
	readonly resolvedTheme: ResolvedTheme;
	readonly setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
	readonly children: React.ReactNode;
	readonly storageKey?: string;
	readonly defaultTheme?: Theme;
}

export function ThemeProvider({
	children,
	storageKey = THEME_STORAGE_KEY,
	defaultTheme = 'system'
}: ThemeProviderProps) {
	const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
	const [systemPrefersDark, setSystemPrefersDark] = React.useState(false);

	// 選好の復元と OS 嗜好の監視（外部システムとの同期なので effect が適切）。
	React.useEffect(() => {
		const stored = localStorage.getItem(storageKey);
		if (isTheme(stored)) {
			setThemeState(stored);
		}
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		setSystemPrefersDark(media.matches);
		const onChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);
		media.addEventListener('change', onChange);
		return () => media.removeEventListener('change', onChange);
	}, [storageKey]);

	const resolvedTheme = resolveTheme(theme, systemPrefersDark);

	// 実テーマの変化で <html> のクラス・color-scheme を同期する。
	React.useEffect(() => {
		const root = document.documentElement;
		root.classList.toggle('dark', resolvedTheme === 'dark');
		root.style.colorScheme = resolvedTheme;
	}, [resolvedTheme]);

	const setTheme = React.useCallback(
		(next: Theme) => {
			setThemeState(next);
			try {
				localStorage.setItem(storageKey, next);
			} catch {
				// localStorage 不可（プライベートモード等）でも UI は機能させる。
			}
		},
		[storageKey]
	);

	const value = React.useMemo<ThemeContextValue>(
		() => ({ theme, resolvedTheme, setTheme }),
		[theme, resolvedTheme, setTheme]
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
	const context = React.useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme は ThemeProvider の内側で使用してください。');
	}
	return context;
}
