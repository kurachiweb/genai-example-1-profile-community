// Jest セットアップ。RTL の DOM マッチャと jest-axe のアクセシビリティマッチャを有効化する。
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// jsdom 未実装の matchMedia をスタブ化(テーマ等で参照)。
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
	window.matchMedia = (query: string): MediaQueryList =>
		({
			matches: false,
			media: query,
			onchange: null,
			addEventListener: () => {},
			removeEventListener: () => {},
			addListener: () => {},
			removeListener: () => {},
			dispatchEvent: () => false
		}) as unknown as MediaQueryList;
}
