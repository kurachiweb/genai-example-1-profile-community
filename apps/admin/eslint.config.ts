// 管理者コンソールの ESLint 設定（Flat Config）。frontend-lib と同方針で
// TypeScript + React + Hooks + jsx-a11y + Prettier を構成する（coding/02 §2）。
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
	{
		ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'next-env.d.ts']
	},
	eslint.configs.recommended,
	tseslint.configs.recommended,
	react.configs.flat.recommended,
	react.configs.flat['jsx-runtime'],
	jsxA11y.flatConfigs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		plugins: { 'react-hooks': reactHooks },
		settings: { react: { version: '19.2' } },
		rules: {
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
			],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'react/prop-types': 'off'
		}
	},
	eslintPluginPrettierRecommended
);
