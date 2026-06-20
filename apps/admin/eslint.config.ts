import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig(
	{
		ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'next-env.d.ts']
	},
	eslint.configs.recommended,
	tseslint.configs.recommended,
	react.configs.flat.recommended,
	react.configs.flat['jsx-runtime'],
	jsxA11y.flatConfigs.recommended,
	reactHooks.configs.flat.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		// version に 'detect' を指定すると eslint-plugin-react 7.37 が ESLint 10 の
		// 削除済み API（context.getFilename）を呼ぶため動かない（明示で検出処理を回避）。
		settings: { react: { version: '19.2' } },
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
			],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			// prop-types は TypeScript の型で代替する。
			'react/prop-types': 'off'
		}
	},
	eslintPluginPrettierRecommended
);
