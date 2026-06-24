// Jest 設定（ts-jest・ESM・jsdom）。フロントエンド共通ライブラリの単体・コンポーネントテストを実行する。
// テスト方針: docs/GUIDES/testing/01-unit-integration.md。RTL でアクセシビリティ起点に検証する。
//
// 型検査は tsc --noEmit に委ね、ts-jest は isolatedModules でトランスパイルのみ行い高速化する。
import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
	rootDir: '.',
	roots: ['<rootDir>/components', '<rootDir>/utilities'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
	testMatch: ['**/*.test.ts', '**/*.test.tsx'],
	testEnvironment: 'jsdom',
	extensionsToTreatAsEsm: ['.ts', '.tsx'],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	transform: {
		'^.+\\.(t|j)sx?$': ['ts-jest', { useESM: true, tsconfig: '<rootDir>/tsconfig.json' }]
	},
	moduleNameMapper: {
		'^@lib/(.*)$': '<rootDir>/$1'
	},
	// カバレッジ対象は再利用される共通ユーティリティ・コンポーネント。Story と型のみのファイルは除外する。
	collectCoverageFrom: [
		'utilities/**/*.{ts,tsx}',
		'components/**/*.{ts,tsx}',
		'!**/*.stories.tsx',
		'!**/*.test.{ts,tsx}',
		'!**/index.ts'
	],
	coverageDirectory: '<rootDir>/coverage',
	coverageThreshold: {
		global: { branches: 80, functions: 80, lines: 80, statements: 80 }
	}
};

export default config;
