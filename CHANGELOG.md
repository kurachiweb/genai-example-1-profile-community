# 変更履歴（CHANGELOG）

本ファイルはリリースログである。記法は [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に準拠し、日付は UTC とする。

## [Unreleased]

### Added

- **管理者コンソール（`apps/admin`）と共通フロントエンド（`apps/frontend-lib`）を実装**（ユニット `admin-console`）。
  - **共通フロントエンド（`apps/frontend-lib`）**: デザイントークン（CSS 変数二層・ライト/ダーク・コーラル差し色、design/00-01）、`cn`／書記素計数（`BR-COMMON-008`）／表示名組み立て（`BR-PROF-003/004`）／ローカルタイム整形（`BR-COMMON-015`）／テーマ解決のユーティリティ、shadcn/ui ベースのプリミティブ（Button/Badge/Card/Input/Label）、`ThemeProvider`、Storybook（Vite）。client でも再利用可能。
  - **`apps/api` の管理者バックエンド**: ドメイン（RBAC 権限マトリクス `BR-ADMIN-002`・ロックアウト防止 `AC-ADMIN-003`・監査イベント＋秘匿値除去 `BR-COMMON-013/014`・モデレーション状態遷移・レート制限しきい値）、ユースケース（認証・WebAuthn・管理者管理・ユーザー管理・モデレーション・API キー運用・統計・監査）、永続化（`admin_accounts`/`admin_webauthn_credentials`/`audit_logs`/`suspensions`/`unfreeze_requests`/`reports`/`api_keys`/`app_settings`）、本番水準認証（Argon2id・セッション 8h/アイドル 30 分・WebAuthn `@simplewebauthn/server`）、GraphQL 管理者サーフェス。
  - **管理者コンソール（`apps/admin`・Next.js 16 / App Router）**: BFF 構成（HttpOnly Cookie セッションをサーバー側で `x-admin-session` 転送・CSRF は Server Action 同一オリジン検証）、左固定サイドバーシェル・テーマ切替、ログイン（メール＋パスワード・パスキー）、ダッシュボード（統計＋要対応キュー）、ユーザー管理（一覧/検索/詳細＋凍結/アイコン削除）、通報審査、解除リクエスト審査、API キー運用＋共通レート制限変更、監査ログ閲覧、管理者・権限管理、パスキー登録/削除。重要操作は確認ダイアログ＋監査明示（`AC-ADMIN-001`〜`013`）。
  - テスト: 管理者ドメイン/ユースケースの Jest 単体＋ GraphQL 統合（ログイン/RBAC/凍結/しきい値/ロックアウト防止）、frontend-lib の RTL + jest-axe、admin の RBAC ナビ絞り込み等。リポジトリ全体で 263 件 GREEN。
  - ESLint/Prettier は `apps/api` 設定を流用しフロント向けに拡張（React/Hooks/jsx-a11y）。§08 コンテンツ配信（お知らせ・メール・ヘルプ・問い合わせ・規約版管理）は後続。
- **公開 REST API（`apps/public-api`）を実装**（ユニット `public-api-rest`）。
  NestJS 11 + MikroORM 7（SQLite / D1 互換）によるクリーンアーキテクチャ構成。
  - ドメイン層: `apps/api` から複製（実効公開ゲート・入力正規化/書記素計数・ハンドル・表示名・カーソル・エラー語彙）＋公開 API 固有の API キースコープ（`read`/`full`、`BR-API-001b`）と `RateLimitError`。共有方針は [ADR 20260617](./docs/adr/20260617-public-api-domain-duplication.md)。
  - ユースケース層: 本人プロフィールのフル CRUD（`PUT` 全体置換・`PATCH` 部分更新・`DELETE` 内容消去＋非公開化）・他者の実効公開分の Read・カーソル一覧。書き込みは `full` スコープ必須。
  - 永続化層: `api_keys` を含む 4 エンティティ（MikroORM 7 EntitySchema）・各リポジトリ・SHA-256 によるキーのハッシュ照合（`node:crypto`、`BR-API-001`）・検証用 seed（read/full 開発キー）。
  - REST 層: 認証ガード（Bearer・ハッシュ照合・所有者 ACTIVE）・スコープガード・キー単位レート制限ガード（`RateLimit-*` ヘッダ・`429`＋`Retry-After`）・共通エンベロープ Interceptor・例外フィルタ・class-validator DTO・OpenAPI/Swagger UI（`/docs`）。ベースパス `/api/public/v1`（`:48034`）。
  - テスト: Jest 単体・統合 108 件（TDD）。受け入れ条件 `AC-API-004〜014` を網羅。ドメイン/ユースケースのカバレッジ 97%。
- **内部 GraphQL API（`apps/api`）のプロフィール共有コアドメインを実装**（ユニット `api-internal-profile`）。
  NestJS 11 + Apollo Server（code-first）+ MikroORM 7（SQLite / D1 互換）によるクリーンアーキテクチャ構成。
  - ドメイン層: 実効公開ゲート（`BR-COMMON-007`）・状態遷移（`COMMON-2`）・入力正規化と書記素計数（`BR-COMMON-008/009`）・ハンドル検証（`BR-SHARE-001/002`）・表示名導出（`BR-PROF-003/004`）・カーソル・エラー語彙（`BR-API-011`）。
  - ユースケース層: プロフィール取得（本人／ハンドル）・一覧（カーソル接続・検索）・更新・公開切替・ハンドル変更・SNS リンク一括設定。Gateway をインターフェースで宣言。
  - 永続化層: MikroORM エンティティ（`users`/`profiles`/`sns_links`）・リポジトリ（Gateway 実装）・実効公開フィルタ・キーセットページング。
  - GraphQL 層: リゾルバ・Connection 型・DataLoader（N+1 回避）・例外フィルタ（`extensions.code`）・ValidationPipe。
  - 起動: 環境変数検証・`main.ts`・ローカル開発用シード。
  - テスト: Jest 単体・統合 107 件（TDD）。ドメイン/ユースケースのカバレッジ 98%。
- AI-DLC の inception/construction 成果物を `aidlc-docs/` に追加。

### Changed

- **MikroORM 7・TypeScript 6 への追従**（`apps/api`・`apps/public-api`）。直近の依存最新化で MikroORM 6→7（デコレータ API 廃止）・TS 5→6 に追従できず `apps/api` が起動・テスト不能になっていたため移行した。
  - エンティティをデコレータから **EntitySchema** へ（既定値/自動列は `Opt` でマーク）。`orm.getSchemaGenerator().updateSchema()` → `orm.schema.update()`、`em.persistAndFlush()` → `persist().flush()`、`ReflectMetadataProvider` 削除。`tsconfig.build` に `rootDir`（TS6 の TS5011 回避）。経緯は [ADR 20260617](./docs/adr/20260617-public-api-domain-duplication.md)。
- **jest を ESM モードへ**（`apps/api`・`apps/public-api`）。MikroORM 7/kysely が ESM 専用（`import.meta` 使用）のため、`node --experimental-vm-modules` + ts-jest `useESM` でネイティブ ESM 評価する。型検査は `tsc --noEmit` に委ね、ts-jest は `isolatedModules` でトランスパイルのみ（`tsconfig.spec.json`）。DI のインターフェース型引数は inline `type` import に。

### Notes

- 後続ユニット: アカウント認証フロー・API キー発行/失効 UI・Trust&Safety・管理者コンソール・コンテンツ配信・NSFW 判定・画像/メール・本番 Hono/Workers アダプタ・レート制限カウンタの Durable Objects 実装。
- ローカル開発ランタイムは `@nestjs/platform-express`、レート制限はメモリ ThrottlerStorage。本番（Cloudflare Workers / Hono・DO カウンタ）は後続ユニットで対応する。
