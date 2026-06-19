// Storybook プレビュー。global.css（トークン）を読み込み、ライト/ダークをツールバーで切り替える。
import * as React from 'react';
import type { Decorator, Preview } from '@storybook/react-vite';
import '../styles/global.css';

const withTheme: Decorator = (Story, context) => {
	const theme = (context.globals.theme as string) ?? 'light';
	React.useEffect(() => {
		document.documentElement.classList.toggle('dark', theme === 'dark');
		document.documentElement.style.colorScheme = theme;
	}, [theme]);
	return (
		<div className="bg-surface text-text rounded-lg p-6">
			<Story />
		</div>
	);
};

const preview: Preview = {
	parameters: {
		layout: 'centered',
		controls: { expanded: true }
	},
	globalTypes: {
		theme: {
			description: 'テーマ',
			defaultValue: 'light',
			toolbar: {
				title: 'テーマ',
				icon: 'mirror',
				items: [
					{ value: 'light', title: 'ライト' },
					{ value: 'dark', title: 'ダーク' }
				],
				dynamicTitle: true
			}
		}
	},
	decorators: [withTheme]
};

export default preview;
