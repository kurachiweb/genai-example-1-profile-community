// Jest 設定（ts-jest・ESM）。公開 REST API（NestJS）の単体・統合テストを実行する。
// テスト方針: docs/GUIDES/testing/01-unit-integration.md。決定性のため外部 I/O は Gateway 境界でフェイク化する。
//
// MikroORM 7 と kysely は ESM 専用（import.meta 使用）のため、jest を ESM モードで動かして
// それらを native ESM として評価する（CJS へのトランスパイルでは import.meta を表現できない）。
// 実行は `node --experimental-vm-modules`（package.json の test スクリプト参照）。
// 型検査は tsc --noEmit に委ね、ts-jest は isolatedModules でトランスパイルのみ行い高速化する。
// tsconfig.spec.json は rootDir を明示し、TS6 の TS5011(common source dir)を回避する。
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testRegex: '.*\\.spec\\.ts$',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@interface/(.*)$': '<rootDir>/src/interface/$1',
  },
  // カバレッジしきい値の対象は「フレームワーク非依存の純粋層（ドメイン・ユースケース）」に限定する。
  // REST/永続化アダプタは統合テスト（test/）で振る舞いを検証する（testing/00-overview.md §3・§4）。
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
