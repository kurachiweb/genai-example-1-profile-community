# コード生成計画 — ユニット `api-internal-profile`

TDD（RED→GREEN→REFACTOR）で進める。各チェックは完了時に `[x]` へ更新する。

## ドメイン層（Entities・純粋 TS / NestJS 非依存）

- [x] `domain/errors.ts`: ドメイン例外＋エラーコード語彙（`BR-API-011` と一致）
- [x] `domain/user-status.ts`: `UserStatus` 列挙＋許可遷移（`COMMON-2`）
- [x] `domain/effective-public.ts`: 実効公開ゲート `effectivePublic`（`BR-COMMON-007`）
- [x] `domain/text.ts`: NFC 正規化・不可視/制御文字除去・トリム（`BR-COMMON-008`/`009`）
- [x] `domain/grapheme.ts`: 書記素クラスタ単位の文字数計数
- [x] `domain/handle.ts`: ハンドル形式検証・予約語（`BR-SHARE-001`/`002`）
- [x] `domain/display-name.ts`: 表示名組み立て・検索名導出（`BR-PROF-003`/`004`/`BR-DISC-004`）
- [x] `domain/cursor.ts`: ULID カーソルの不透明エンコード/デコード（可逆・不透明）
- [x] 単体テスト（正常系・異常系・境界値を区別）

## ユースケース層（Use Cases・Gateway 宣言）

- [x] `application/gateways.ts`: `UserRepository`/`ProfileRepository`/`SnsLinkRepository`/`Clock`/`IdGenerator`/`ViewerContext`
- [x] `application/profile.service.ts`: 取得（自分/ハンドル）・一覧・更新・公開切替・ハンドル変更・SNS 一括設定
- [x] フェイク Gateway による単体テスト（実効公開・所有権・検証違反・カーソル）

## 永続化層（Interface Adapters / Frameworks）

- [x] `infrastructure/persistence/entities/`: `UserEntity`/`ProfileEntity`/`SnsLinkEntity`（MikroORM・命名戦略 underscore）
- [x] `infrastructure/persistence/*.repository.ts`: Gateway 実装
- [x] `infrastructure/mikro-orm.config.ts`: SQLite 設定（FK 有効化）

## GraphQL 層（Interface Adapters）

- [x] `interface/graphql/types/`: `Profile`/`SnsLink`/Connection/Input/Payload 型（code-first）
- [x] `interface/graphql/profile.resolver.ts`: Query/Mutation・`snsLinks` フィールドリゾルバ（DataLoader）
- [x] `interface/graphql/sns-link.loader.ts`: DataLoader（profileId バッチ）
- [x] `interface/graphql/domain-error.filter.ts`: 例外 → `extensions.code` 写像
- [x] `interface/graphql/validators/`: 書記素長・正規化のカスタムバリデータ
- [x] 統合テスト（Nest Testing + インメモリ SQLite）

## アプリ起動（Frameworks & Drivers / Composition root）

- [x] `config/env.ts`: 必須環境変数の起動時検証
- [x] `app.module.ts`: モジュール結線（Gateway をトークンで束ねる）
- [x] `main.ts`: bootstrap（ValidationPipe・Playground は dev 限定）
- [x] `infrastructure/seed.ts`: ローカル開発用シード

## 完了条件

- [x] `pnpm --filter @app/api test` が全て GREEN
- [x] カバレッジ: ドメイン/ユースケースの中核ロジックを正常系・異常系・境界値で網羅
- [x] `docs/`・README・CHANGELOG・CODEMAPS を実装状態へ更新
