import { getThemeInitScript, isTheme, resolveTheme, THEME_STORAGE_KEY } from '@/utilities/theme';

describe('resolveTheme', () => {
	test('明示 light/dark はそのまま返す', () => {
		expect(resolveTheme('light', true)).toBe('light');
		expect(resolveTheme('dark', false)).toBe('dark');
	});

	test('system は OS 嗜好に追従する', () => {
		expect(resolveTheme('system', true)).toBe('dark');
		expect(resolveTheme('system', false)).toBe('light');
	});
});

describe('isTheme', () => {
	test('有効な値のみ true', () => {
		expect(isTheme('light')).toBe(true);
		expect(isTheme('dark')).toBe(true);
		expect(isTheme('system')).toBe(true);
	});

	test('無効な値は false', () => {
		expect(isTheme('blue')).toBe(false);
		expect(isTheme(null)).toBe(false);
		expect(isTheme(undefined)).toBe(false);
	});
});

describe('getThemeInitScript', () => {
	test('保存キーを含み、.dark の切替を行う即時関数を返す', () => {
		const script = getThemeInitScript();

		expect(script).toContain(THEME_STORAGE_KEY);
		expect(script).toContain("classList.toggle('dark'");
		expect(script).toContain('prefers-color-scheme: dark');
	});

	test('カスタムキーを反映する', () => {
		expect(getThemeInitScript('custom-key')).toContain('custom-key');
	});
});
