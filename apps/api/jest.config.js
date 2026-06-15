// Jest 設定（ts-jest）。内部 GraphQL API（NestJS）の単体・統合テストを実行する。
// テスト方針: docs/GUIDES/testing/01-unit-integration.md。決定性のため外部 I/O は Gateway 境界でフェイク化する。
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testRegex: '.*\\.spec\\.ts$',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json', isolatedModules: false }],
  },
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@interface/(.*)$': '<rootDir>/src/interface/$1',
  },
  // カバレッジしきい値の対象は「フレームワーク非依存の純粋層（ドメイン・ユースケース）」に限定する。
  // GraphQL/永続化アダプタは統合テスト（test/）で振る舞いを検証する（testing/00-overview.md §3・§4）。
  collectCoverageFrom: [
    'src/domain/**/*.ts',
    'src/application/**/*.ts',
    '!src/**/*.spec.ts',
    // 型・DI トークンの宣言のみ(実行ロジックなし)は計測対象外。
    '!src/application/gateways.ts',
    '!src/application/models.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};
