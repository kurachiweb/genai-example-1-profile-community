// Storybook 設定（React + Vite）。コンポーネントカタログを提供する（CLAUDE.md・design/04 §6）。
import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
	stories: ['../components/**/*.stories.@(ts|tsx)'],
	addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
	framework: { name: '@storybook/react-vite', options: {} },
	// Tailwind v4 のユーティリティを Storybook でも有効化する（global.css 経由）。
	viteFinal: async (viteConfig) => {
		viteConfig.plugins = viteConfig.plugins ?? [];
		viteConfig.plugins.push(tailwindcss());
		return viteConfig;
	}
};

export default config;
