// フロントエンド共通ライブラリの ESLint 設定（Flat Config）。
// apps/api の構成（@eslint/js + typescript-eslint + prettier 統合）を流用し、
// React/Hooks/jsx-a11y を追加する（coding/02-lint-format-commit.md §2）。
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
	{
		ignores: ['node_modules/**', 'coverage/**', 'storybook-static/**', '.storybook/**']
	},
	eslint.configs.recommended,
	tseslint.configs.recommended,
	// React 17+ の自動 JSX ランタイムを前提にし、react-in-jsx-scope を無効化する。
	react.configs.flat.recommended,
	react.configs.flat['jsx-runtime'],
	// アクセシビリティ（WCAG 2.2 AA）を静的解析でも担保する（design/04-content-a11y.md）。
	jsxA11y.flatConfigs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		plugins: { 'react-hooks': reactHooks },
		// version は明示する。'detect' は eslint-plugin-react 7.37 が ESLint 10 の
		// 削除済み API（context.getFilename）を呼ぶため動かない（明示で検出処理を回避）。
		settings: { react: { version: '19.2' } },
		rules: {
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			// アンダースコア接頭辞の未使用変数・引数は意図的な無視として許容する。
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
			],
			// 型注釈の明示は任意（apps/api と同方針）。
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			// prop-types は TypeScript の型で代替する。
			'react/prop-types': 'off'
		}
	},
	eslintPluginPrettierRecommended
);
