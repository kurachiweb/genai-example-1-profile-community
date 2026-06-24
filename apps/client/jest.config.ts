// Jest 設定。next/jest が SWC でのトランスパイル・CSS モック・transpilePackages を扱う。
// フロントエンドの単体・コンポーネントテスト(RTL + jest-axe)を実行する(testing/01・ecc-web/testing)。
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@lib/(.*)$': '<rootDir>/lib/$1'
	},
	testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
	collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/*.test.{ts,tsx}']
};

export default createJestConfig(config);
