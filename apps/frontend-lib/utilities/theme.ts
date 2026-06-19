// テーマ解決の純粋ロジック（design/01 §2.5）。ライトを既定とし、ダークは意図的な代替テーマ。
// 明示選択（light/dark）が無いときのみ OS の prefers-color-scheme に追従する。
// React 非依存の純粋関数として切り出し、client / admin の双方で再利用する。

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

/** localStorage の選好キー。client/admin はドメイン分離のため別ストアになる。 */
export const THEME_STORAGE_KEY = 'gpc-theme';

export function isTheme(value: unknown): value is Theme {
	return value === 'light' || value === 'dark' || value === 'system';
}

/** 選好（light/dark/system）と OS の暗色嗜好から実テーマを決定する。 */
export function resolveTheme(theme: Theme, systemPrefersDark: boolean): ResolvedTheme {
	if (theme === 'system') {
		return systemPrefersDark ? 'dark' : 'light';
	}
	return theme;
}

/**
 * 初回描画前に `.dark` クラスを適用して FOUC（テーマのちらつき）を防ぐ初期化スクリプト。
 * Next.js の <head> にインラインで埋め込む（design/01 §2.5）。
 */
export function getThemeInitScript(storageKey: string = THEME_STORAGE_KEY): string {
	return `(function(){try{var t=localStorage.getItem(${JSON.stringify(storageKey)});var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=(t==='dark')||((t===null||t==='system')&&d);var e=document.documentElement;e.classList.toggle('dark',r);e.style.colorScheme=r?'dark':'light';}catch(_){}})();`;
}
