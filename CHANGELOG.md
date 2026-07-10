# 変更履歴（CHANGELOG）

本ファイルはリリースログである。記法は [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に準拠し、日付は UTC とする。

## [Unreleased]

### Fixed

- **本番/dev（Cloudflare Workers）で新規登録時に `queryA ENOTFOUND localhost` が発生し確認メール送信・完了画面への遷移が失敗する不具合を修正**（`apps/api`／CI）。Workers 環境には Mailpit の SMTP ホストが存在せず、かつ「本番は Amazon SES へ差し替える」という設計（コメントのみ）が未実装だったため、`NodemailerMailSender` がフォールバック値 `'localhost'` へ SMTP 接続を試みて失敗していた。`SesMailSender`（`ses-mail-sender.ts`）を追加し、既存の `isWorkersRuntime()`（D1 バインディング有無、`mikro-orm.config.ts` と同一 signal）でランタイムを判定して、Workers 実行時は SES・ローカルは従来通り Mailpit に自動で切り替わるようにした（`user.module.ts`・`admin.module.ts`）。`deploy-dev.yml` に `MAIL_FROM`/`AWS_DEFAULT_REGION`/`AWS_SES_ACCESS_KEY_ID`/`AWS_SES_SECRET_ACCESS_KEY` を `PASSWORD_PEPPER` と同型で Wrangler Secrets へ自動設定するステップを追加。
  - **追補**: 当初 `@aws-sdk/client-ses` で実装したが、実際に Workers へデプロイすると `SESClient` 構築時に `TypeError: emitWarningIfUnsupportedVersion$1 is not a function`（Node 専用ランタイム検知コードの esbuild バンドル不整合）で起動不能になることが実機で判明した。Amazon Rekognition と同型の `aws4fetch`（軽量 SigV4 署名 fetch、Node 固有コード無し）で SESv2 REST API を直接呼ぶ方式に差し替え、実 AWS SES への疎通を確認した上で解消した（[ADR](./docs/adr/20260710-ses-mail-aws4fetch.md)）。
- **`help_articles` に公開状態の記事があっても `apps/client` の `/helps` で 404 になる不具合を修正**（`apps/api`／`apps/client`）。§08 コンテンツ（ヘルプ記事）の公開閲覧（`BR-CONTENT-005`/`AC-CONTENT-005`）が admin 側の作成・編集・公開/非公開切替のみ実装され、client 側の一覧・詳細閲覧面が欠落していた。`apps/api` にログイン不要の公開 GraphQL（`publicHelpArticles`/`publicHelpArticle`、既存 `HelpArticleRepository` を再利用）を追加し、`apps/client` に `/helps`（一覧、公開状態の記事のみカテゴリ別グルーピング・カテゴリ内更新日時降順・ページネーションなし、`AC-CONTENT-005b`）と `/helps/[slug]`（詳細、既存の `MarkdownContent` で本文表示）を追加した。あわせてフッターのヘルプリンク（`/help` → `/helps`）の誤りを修正。
- **`apps/admin` で発行した利用規約・プライバシーポリシーが `apps/client` の `/terms`・`/privacy` で 404 になる不具合を修正**（`apps/api`／`apps/frontend-lib`／`apps/client`）。§08 コンテンツ（規約・ポリシー）の公開閲覧（`BR-CONTENT-010`/`AC-CONTENT-011`）が admin 側の版管理・発効機能のみ実装され、client 側の閲覧面が欠落していた。`apps/api` にログイン不要の公開 GraphQL（`publicPolicy`/`publicPolicyVersions`/`publicPolicyVersion`）を追加し、`apps/frontend-lib` に `dangerouslySetInnerHTML` を使わない自作の安全な Markdown レンダラー（`MarkdownContent`、`AC-CONTENT-002` 相当の無害化要件を構造的に満たす）を追加、`apps/client` に `/terms`・`/privacy`（現行版）と `/terms/[version]`・`/privacy/[version]`（過去版）を追加した。
- **ローカル開発で `apps/api` を再起動するとログインセッションが失われる不具合を修正**（`apps/api`）。利用者・管理者セッション、メール確認/パスワードリセット/メール変更トークン、WebAuthn チャレンジをインプロセス（`Map`）で保持していたため、api コンテナ再起動のたびに全セッションが揮発していた。ローカル用に Valkey（`compose.yaml`、ポート 48036、Cloudflare KV 相当）を追加し、`ValkeyUserSessionStore`/`ValkeyAdminSessionStore`/`ValkeyWebauthnChallengeStore`/`ValkeyEmailVerificationTokenStore` へ差し替え。キー設計は本番 KV と同一形式（`sess:client:<hash>` 等、`db/01-data-model.md` §7）に揃え、インメモリ実装は完全に削除した。セッション ID・トークンは SHA-256 でハッシュ化してから Valkey キーへ用い、平文で保存しない（`BR-COMMON-014`）。
- **会員登録（`register`）時にメールアドレス確認メールが送信されない不具合を修正**（`apps/api`）。`UserService.register`/`resendVerificationEmail` が確認トークンを発行するだけで送信処理が未実装だった（`BR-ACCT-003`）ため、既存の `MailSender`（nodemailer→Mailpit）を `UserModule` に配線し、確認メール・既登録案内メール（`BR-ACCT-001`）を実際に送信するよう修正。

### Added

- **管理者コンソール（`apps/admin`）と共通フロントエンド（`apps/frontend-lib`）を実装**（ユニット `admin-console`）。
  - **共通フロントエンド（`apps/frontend-lib`）**: デザイントークン（CSS 変数二層・ライト/ダーク・コーラル差し色、design/00-01）、`cn`／書記素計数（`BR-COMMON-008`）／表示名組み立て（`BR-PROF-003/004`）／ローカルタイム整形（`BR-COMMON-015`）／テーマ解決のユーティリティ、shadcn/ui ベースのプリミティブ（Button/Badge/Card/Input/Label）、`ThemeProvider`、Storybook（Vite）。client でも再利用可能。
  - **`apps/api` の管理者バックエンド**: ドメイン（RBAC 権限マトリクス `BR-ADMIN-002`・ロックアウト防止 `AC-ADMIN-003`・監査イベント＋秘匿値除去 `BR-COMMON-013/014`・モデレーション状態遷移・レート制限しきい値）、ユースケース（認証・WebAuthn・管理者管理・ユーザー管理・モデレーション・API キー運用・統計・監査）、永続化（`admin_accounts`/`admin_webauthn_credentials`/`audit_logs`/`suspensions`/`unfreeze_requests`/`reports`/`api_keys`/`app_settings`）、本番水準認証（Argon2id・セッション 8h/アイドル 30 分・WebAuthn `@simplewebauthn/server`）、GraphQL 管理者サーフェス。
  - **管理者コンソール（`apps/admin`・Next.js 16 / App Router）**: BFF 構成（HttpOnly Cookie セッションをサーバー側で `x-admin-session` 転送・CSRF は Server Action 同一オリジン検証）、左固定サイドバーシェル・テーマ切替、ログイン（メール＋パスワード・パスキー）、ダッシュボード（統計＋要対応キュー）、ユーザー管理（一覧/検索/詳細＋凍結/アイコン削除）、通報審査、解除リクエスト審査、API キー運用＋共通レート制限変更、監査ログ閲覧、管理者・権限管理、パスキー登録/削除。重要操作は確認ダイアログ＋監査明示（`AC-ADMIN-001`〜`013`）。
  - **§08 コンテンツ&コミュニケーション**: お知らせ（作成/編集/公開/非公開/削除・公開開始終了・重要度）、メール通知（下書き/テスト送信/配信・MJML 相当 HTML・Mailpit 送信・受信者オプトイン解決）、ヘルプ記事（作成/編集/公開切替・スラッグ一意）、問い合わせ対応（状態管理・report/unfreeze はキュー連携）、規約・ポリシー版管理（新版作成/発効・公開中 1 版・履歴保持・再同意フラグ）。RBAC は BR-CONTENT-001/003 に従い お知らせ公開/メール配信を `moderator` 以上、規約は `super_admin` のみ。`apps/api` に対応エンティティ・リポジトリ・GraphQL・`MailSender`（nodemailer→Mailpit、本番 SES へ差し替え）を追加。
  - テスト: 管理者ドメイン/ユースケースの Jest 単体＋ GraphQL 統合（ログイン/RBAC/凍結/しきい値/ロックアウト防止/§08 お知らせ公開・規約発効・問い合わせ遷移ほか）、frontend-lib の RTL + jest-axe、admin の RBAC ナビ絞り込み等。リポジトリ全体で 292 件 GREEN。
  - ESLint/Prettier は `apps/api` 設定を流用しフロント向けに拡張（React/Hooks/jsx-a11y）。
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
- **Cloudflare Workers への実デプロイ基盤（Terraform・CI/CD・OpenNext・Durable Objects）を実装**。
  - **`apps/infra`（Terraform）**: D1・KV（用途別3系統）・R2（アイコン原本・client/admin の ISR/Data Cache）を管理。環境分離は Terraform workspace（`dev`/`prod`）。state バックエンドは R2（S3 互換）。
  - **`apps/api`・`apps/public-api` の Workers 実行**: NestJS を `@nestjs/platform-express` のまま、Cloudflare 公式 Express-on-Workers サポート（`cloudflare:node` の `httpServerHandler`）で動かす。当初計画していた Hono アダプタは、実装時の実機検証を経て不採用とした（[ADR 20260709](./docs/adr/20260709-nestjs-workers-express-adapter.md)）。
  - **MikroORM マイグレーション基盤**: `apps/api` にマイグレーション生成・wrangler 形式への書き出し（`migration:export-wrangler`）・D1 への適用（`migration:apply-remote`）を追加。`wrangler d1 migrations apply --remote` の既知の不具合（`CREATE TRIGGER` を含む SQL で失敗）を回避する自前スクリプトを使用（[db/02-migrations.md](./docs/GUIDES/db/02-migrations.md) §1）。
  - **公開 API のキー単位レート制限**: Durable Objects（SQLite ストレージバックエンド）で厳密カウントを実装（[ADR 20260604](./docs/adr/20260604-public-api-rate-limit-durable-objects.md)）。
  - **`apps/client`・`apps/admin` の OpenNext 化**: `@opennextjs/cloudflare` で Cloudflare Workers へデプロイ（[ADR 20260604](./docs/adr/20260604-nextjs-workers-opennext.md)）。
  - **CI/CD（GitHub Actions）**: `ci.yml`（lint/型/テスト/機密情報スキャン/依存監査）、`deploy-dev.yml`（main push で D1 マイグレーション・Terraform apply・4 Worker のデプロイを自動実行）、`deploy-prod.yml`（`git tag` push、Environment の Required reviewers による人間の承認ゲート）。
  - **パスワードハッシュ化を PBKDF2-HMAC-SHA256 へ**: 当初 Argon2id（hash-wasm）を採用していたが、hash-wasm が実行時に `WebAssembly.compile()` する実装のため Cloudflare Workers の実行時コード生成禁止制約に抵触し、ハッシュ検証が常に失敗する不具合が実機デプロイで判明した。Web Crypto API（`crypto.subtle`）ネイティブの PBKDF2 へ切り替えた。さらに Workers の `crypto.subtle` は PBKDF2 のイテレーション数上限が 100,000 であり OWASP 推奨値（600,000）に届かないため、DB とは独立した秘密鍵（`PASSWORD_PEPPER`、Wrangler Secrets）による HMAC 事前処理で補っている（`BR-COMMON-003`）。

### Changed

- **MikroORM 7・TypeScript 6 への追従**（`apps/api`・`apps/public-api`）。直近の依存最新化で MikroORM 6→7（デコレータ API 廃止）・TS 5→6 に追従できず `apps/api` が起動・テスト不能になっていたため移行した。
  - エンティティをデコレータから **EntitySchema** へ（既定値/自動列は `Opt` でマーク）。`orm.getSchemaGenerator().updateSchema()` → `orm.schema.update()`、`em.persistAndFlush()` → `persist().flush()`、`ReflectMetadataProvider` 削除。`tsconfig.build` に `rootDir`（TS6 の TS5011 回避）。経緯は [ADR 20260617](./docs/adr/20260617-public-api-domain-duplication.md)。
- **jest を ESM モードへ**（`apps/api`・`apps/public-api`）。MikroORM 7/kysely が ESM 専用（`import.meta` 使用）のため、`node --experimental-vm-modules` + ts-jest `useESM` でネイティブ ESM 評価する。型検査は `tsc --noEmit` に委ね、ts-jest は `isolatedModules` でトランスパイルのみ（`tsconfig.spec.json`）。DI のインターフェース型引数は inline `type` import に。

### Notes

- prod 環境（Terraform `prod` ワークスペース）は初回 `terraform apply` が未実行。`deploy-prod.yml`（`git tag` push）の実行を待つ状態（人間のみが実行、[infra/02-deployment.md](./docs/GUIDES/infra/02-deployment.md) §4.3）。
