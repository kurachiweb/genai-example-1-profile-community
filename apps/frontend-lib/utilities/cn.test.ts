import { cn } from '@/utilities/cn';

describe('cn', () => {
	test('複数のクラス文字列を結合する', () => {
		// Arrange / Act
		const result = cn('px-2', 'py-1');

		// Assert
		expect(result).toBe('px-2 py-1');
	});

	test('falsy な値（false/undefined/null）を無視する', () => {
		const result = cn('text-text', false, undefined, null, 'font-medium');

		expect(result).toBe('text-text font-medium');
	});

	test('条件付きオブジェクト記法を解決する', () => {
		const isActive = true;
		const result = cn('btn', { 'btn-active': isActive, 'btn-disabled': false });

		expect(result).toBe('btn btn-active');
	});

	test('衝突する Tailwind ユーティリティは後勝ちでマージする', () => {
		// tailwind-merge により px-2 は px-4 に上書きされる。
		const result = cn('px-2 py-1', 'px-4');

		expect(result).toBe('py-1 px-4');
	});

	test('配列を受け取れる', () => {
		const result = cn(['flex', 'items-center'], 'gap-2');

		expect(result).toBe('flex items-center gap-2');
	});
});
