import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginTailwindcss from 'eslint-plugin-tailwindcss';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig(
	{
		ignores: ['node_modules/**', 'coverage/**', 'storybook-static/**', '.storybook/**']
	},
	eslint.configs.recommended,
	tseslint.configs.recommended,
	react.configs.flat.recommended,
	react.configs.flat['jsx-runtime'],
	jsxA11y.flatConfigs.recommended,
	reactHooks.configs.flat.recommended,
	eslintPluginTailwindcss.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		// version に 'detect' を指定すると eslint-plugin-react 7.37 が ESLint 10 の
		// 削除済み API（context.getFilename）を呼ぶため動かない（明示で検出処理を回避）。
		settings: {
			react: { version: '19.2' },
			tailwindcss: { cssConfigPath: './styles/global.css' }
		},
		rules: {
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
			],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			// prop-types は TypeScript の型で代替する。
			'react/prop-types': 'off',
			// クラスの並び順は prettier-plugin-tailwindcss が担うため、二重管理を避けて無効化する。
			'tailwindcss/classnames-order': 'off'
		}
	},
	eslintPluginPrettierRecommended
);
