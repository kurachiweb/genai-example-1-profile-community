// Jest 設定。next/jest が SWC でのトランスパイル・CSS モック・transpilePackages を扱う。
// フロントエンドの単体・コンポーネントテスト(RTL + jest-axe)を実行する(testing/01・ecc-web/testing)。
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@lib/(.*)$': '<rootDir>/lib/$1'
	},
	testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
	collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/*.test.{ts,tsx}']
};

module.exports = createJestConfig(config);
