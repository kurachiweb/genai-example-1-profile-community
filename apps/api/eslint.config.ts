import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig(
	{
		ignores: ['dist/**', 'coverage/**', 'node_modules/**']
	},
	eslint.configs.recommended,
	tseslint.configs.recommended,
	{
		rules: {
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off'
		}
	},
	eslintPluginPrettierRecommended
);
