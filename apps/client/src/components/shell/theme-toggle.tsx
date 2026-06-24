'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@lib';
import { useTheme } from '@lib';

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label={resolvedTheme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
			onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
		>
			{resolvedTheme === 'dark' ? (
				<Sun className="size-4" aria-hidden="true" />
			) : (
				<Moon className="size-4" aria-hidden="true" />
			)}
		</Button>
	);
}
