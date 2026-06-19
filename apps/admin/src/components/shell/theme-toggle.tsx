// テーマ切替(ライト/ダーク/システム)。design 01-foundations §2.5 の 3 択。
'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { cn, useTheme, type Theme } from '@app/frontend-lib';

const OPTIONS: ReadonlyArray<{ value: Theme; label: string; Icon: typeof Sun }> = [
	{ value: 'light', label: 'ライト', Icon: Sun },
	{ value: 'dark', label: 'ダーク', Icon: Moon },
	{ value: 'system', label: 'システム', Icon: Monitor }
];

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	return (
		<div
			role="group"
			aria-label="テーマ切替"
			className="flex items-center gap-0.5 rounded-md border border-border p-0.5"
		>
			{OPTIONS.map(({ value, label, Icon }) => (
				<button
					key={value}
					type="button"
					onClick={() => setTheme(value)}
					aria-pressed={theme === value}
					title={label}
					className={cn(
						'rounded p-1.5 transition-colors',
						theme === value ? 'bg-accent text-accent-contrast' : 'text-text-muted hover:text-text'
					)}
				>
					<Icon className="size-4" aria-hidden="true" />
					<span className="sr-only">{label}</span>
				</button>
			))}
		</div>
	);
}
