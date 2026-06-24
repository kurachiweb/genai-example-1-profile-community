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
} from '../../utilities/theme';

interface ThemeContextValue {
	readonly theme: Theme;
	readonly resolvedTheme: ResolvedTheme;
	readonly setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

// localStorage の選好を読み書きする外部ストア。useSyncExternalStore で購読するため
// effect 内での setState を避けられる（cascading renders 回避 / react-hooks 規約）。
function createThemeStore(storageKey: string, defaultTheme: Theme) {
	const listeners = new Set<() => void>();
	const notify = () => {
		for (const listener of listeners) {
			listener();
		}
	};
	return {
		subscribe(listener: () => void) {
			listeners.add(listener);
			// 他タブでの変更にも追従する。
			const onStorage = (event: StorageEvent) => {
				if (event.key === storageKey) {
					notify();
				}
			};
			window.addEventListener('storage', onStorage);
			return () => {
				listeners.delete(listener);
				window.removeEventListener('storage', onStorage);
			};
		},
		getSnapshot(): Theme {
			try {
				const stored = localStorage.getItem(storageKey);
				return isTheme(stored) ? stored : defaultTheme;
			} catch {
				return defaultTheme;
			}
		},
		getServerSnapshot(): Theme {
			return defaultTheme;
		},
		setTheme(next: Theme) {
			try {
				localStorage.setItem(storageKey, next);
			} catch {
				// localStorage 不可（プライベートモード等）でも UI は機能させる。
			}
			notify();
		}
	};
}

// OS の暗色嗜好を購読する外部ストア。
function subscribeSystemPrefersDark(listener: () => void) {
	const media = window.matchMedia('(prefers-color-scheme: dark)');
	media.addEventListener('change', listener);
	return () => media.removeEventListener('change', listener);
}

function getSystemPrefersDark(): boolean {
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

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
	const store = React.useMemo(
		() => createThemeStore(storageKey, defaultTheme),
		[storageKey, defaultTheme]
	);

	// 選好の復元と OS 嗜好の監視は外部システムとの同期なので useSyncExternalStore で購読する。
	const theme = React.useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getServerSnapshot
	);
	const systemPrefersDark = React.useSyncExternalStore(
		subscribeSystemPrefersDark,
		getSystemPrefersDark,
		() => false
	);

	const resolvedTheme = resolveTheme(theme, systemPrefersDark);

	// 実テーマの変化で <html> のクラス・color-scheme を同期する。
	React.useEffect(() => {
		const root = document.documentElement;
		root.classList.toggle('dark', resolvedTheme === 'dark');
		root.style.colorScheme = resolvedTheme;
	}, [resolvedTheme]);

	const setTheme = React.useCallback((next: Theme) => store.setTheme(next), [store]);

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
