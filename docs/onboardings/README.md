# オンボーディングガイド — GenAI Profile Community

本プロジェクトに参加した開発者が、サービス像・仕様・インフラ・データベースを最短で把握し、ローカル環境を立ち上げるための入り口（索引）。

> **このサービスは何か**: アイコン・名前・職業を登録し、固有 URL の公開ページとして共有できるプロフィール共有サービス。画面操作と公開 API の両方からプロフィールを CRUD できる（[README.md](../../README.md) / [サービス概要](../service/overview/01-overview.md)）。
> **現状フェーズ**: 仕様・ドキュメント策定フェーズであり、`apps/` 配下の実装は未着手。各ガイドは実装に先行する設計仕様として読むこと。

## 1. まず読む順番（推奨）

```
① サービス像        ② 仕様の正本        ③ 技術ガイド            ④ エージェント設定
overview/  →  features/(SSoT) + glossary  →  GUIDES/infra・GUIDES/db  →  onboardings/agent-setting.md
（何を・誰に・なぜ）   （どう振る舞うか）         （どう作る・載せる）        （Claude 拡張の使い方）
```

1. **サービス像を掴む**: [docs/service/overview/](../service/overview/) を 01→04 の順に読む。
2. **仕様の正本を確認する**: [docs/service/features/](../service/features/)（ビジネスルール・受け入れ条件の SSoT）。まず [00-common-rules.md](../service/features/00-common-rules.md) を読み、公開ゲート・状態モデル・レート制限を理解する。用語は [glossary.md](../service/glossary.md)。
3. **技術ガイドを読む**: [インフラ](../GUIDES/infra/)・[データベース](../GUIDES/db/)・[API](../GUIDES/api/)・[コーディング](../GUIDES/coding/)・[テスト](../GUIDES/testing/)。
4. **開発環境とエージェント設定**: 本ページ §3 と [agent-setting.md](./agent-setting.md)。

## 2. ドキュメント索引

### サービス仕様（`docs/service/`）

| ドキュメント | 内容 |
| --- | --- |
| [overview/](../service/overview/) | サービス概要・コンセプト・ターゲット/ペルソナ・ユーザーストーリー |
| [features/](../service/features/) | **ビジネスルール・受け入れ条件の正本（SSoT）**。エンティティ単位で分割 |
| [glossary.md](../service/glossary.md) | サービス内ドメイン用語集 |
| [screens/](../service/) | 画面仕様・ワイヤーフレーム（今後整備） |

### インフラガイド（`docs/GUIDES/infra/`）

| ドキュメント | 内容 |
| --- | --- |
| [infra/00-overview.md](../GUIDES/infra/00-overview.md) | インフラ全体像・アプリ構成・Cloudflare リソース・環境（local/dev/prod） |
| [infra/01-network-architecture.md](../GUIDES/infra/01-network-architecture.md) | ネットワーク構成図・リクエストフロー・セッション分離・レート制限二層 |
| [infra/02-deployment.md](../GUIDES/infra/02-deployment.md) | CI/CD パイプライン・環境別デプロイ・Terraform・ロールバック |
| [infra/03-logging-monitoring.md](../GUIDES/infra/03-logging-monitoring.md) | LogTape 構造化ログ・Sentry・監査ログ・保持方針 |

### データベースガイド（`docs/GUIDES/db/`）

| ドキュメント | 内容 |
| --- | --- |
| [db/00-overview.md](../GUIDES/db/00-overview.md) | DB 設計原則・命名規約・ID/時刻方針・D1 と KV の役割分担 |
| [db/01-data-model.md](../GUIDES/db/01-data-model.md) | ERD・全テーブル定義・インデックス・KV/DO/R2 配置 |
| [db/02-migrations.md](../GUIDES/db/02-migrations.md) | MikroORM Migrator 中心の手順・wrangler での D1 適用・ロールバック |

### API ガイド（`docs/GUIDES/api/`）

| ドキュメント | 内容 |
| --- | --- |
| [api/00-overview.md](../GUIDES/api/00-overview.md) | API 全体方針・2 面（内部 GraphQL / 公開 REST）の分離・横断する設計原則・バージョニング |
| [api/01-graphql-internal.md](../GUIDES/api/01-graphql-internal.md) | 内部 GraphQL API（`apps/api`）の設計規約・エラー表現・DataLoader・型生成 |
| [api/02-public-rest-api.md](../GUIDES/api/02-public-rest-api.md) | 公開 REST API（`apps/public-api`）の設計規約・エンベロープ/エラー写像/認可/レート制限/OpenAPI |
| [api/03-public-api-developer-guide.md](../GUIDES/api/03-public-api-developer-guide.md) | 公開 API 開発者向け利用ガイド（キー発行→疎通・エラー対処・代表レシピ） |

### コーディングガイド（`docs/GUIDES/coding/`）

| ドキュメント | 内容 |
| --- | --- |
| [coding/00-overview.md](../GUIDES/coding/00-overview.md) | コーディング原則。言語/TypeScript 方針・KISS/DRY/YAGNI・イミュータビリティ・ファイル構成/命名・境界検証・エラー処理 |
| [coding/01-architecture.md](../GUIDES/coding/01-architecture.md) | アーキテクチャ設計。モノレポ・バックエンドのクリーンアーキテクチャ・フロントエンドの責務分割と状態管理・アプリ境界 |
| [coding/02-lint-format-commit.md](../GUIDES/coding/02-lint-format-commit.md) | ESLint(Flat Config)/Prettier・Husky + lint-staged・Commitlint・Gitleaks/TruffleHog・CI 品質ゲート（Stylelint 不採用） |
| [coding/03-docker.md](../GUIDES/coding/03-docker.md) | Docker 構成。ローカル開発専用・`node@trixie`・Dockerfile/`docker-compose.yaml`・ポート・Mailpit・秘匿 |
| [coding/04-nestjs.md](../GUIDES/coding/04-nestjs.md) | NestJS 実装規約（`api`/`public-api`）。モジュール/DI・ガード/パイプ/インターセプタ/フィルタ・Throttler・Hono |
| [coding/05-tailwind.md](../GUIDES/coding/05-tailwind.md) | Tailwind CSS 規約（`client`/`admin`）。デザイントークン・抽象化・レスポンシブ・モーション・shadcn/ui |
| [coding/06-mikroorm.md](../GUIDES/coding/06-mikroorm.md) | MikroORM 実装規約。エンティティ/命名戦略・EntityManager(fork)・トランザクション・N+1/カーソル・マイグレーション |

> Next.js / React 固有のコーディングルールは Skills（ECC のフロントエンド系スキル）で定義済みのため、本ディレクトリには含めない。

### テストガイド（`docs/GUIDES/testing/`）

| ドキュメント | 内容 |
| --- | --- |
| [testing/00-overview.md](../GUIDES/testing/00-overview.md) | テスト戦略。TDD サイクル・テスト種別・カバレッジ 80%・正確性優先の配分・決定性・ツール対応 |
| [testing/01-unit-integration.md](../GUIDES/testing/01-unit-integration.md) | 単体・統合テスト。Jest・React Testing Library・jest-axe・Supertest・MikroORM/DB テスト・モック/フェイク戦略 |
| [testing/02-e2e.md](../GUIDES/testing/02-e2e.md) | E2E。Playwright・重要フロー・Page Object・ビジュアル回帰/アクセシビリティ（補助）・成果物・CI |

### その他のガイド（`docs/GUIDES/`）

| ディレクトリ | 内容 |
| --- | --- |
| `design-system/` | デザインシステム・Storybook（今後整備） |
| `operations/` | 運用・障害対応・ロールバック手順（今後整備） |
| `security/` | セキュリティ・認証認可設計・監視方針（今後整備） |

### エージェント・開発支援（`docs/onboardings/`）

| ドキュメント | 内容 |
| --- | --- |
| [agent-setting.md](./agent-setting.md) | `.claude/` 配下のスキル・ルール・エージェント定義の解説 |

### アーキテクチャ決定記録（`docs/adr/`）

アーキテクチャ上の決定の文脈・代替案・根拠を構造化して記録する（`ecc-architecture-decision-records` スキルで生成・更新）。

| ドキュメント | 内容 |
| --- | --- |
| [adr/20260603-profile-search-fts5.md](../adr/20260603-profile-search-fts5.md) | プロフィール検索（`BR-DISC-004`）で FTS5 を採用せず正規化列＋LIKE を用いる決定 |
| [adr/20260603-nsfw-moderation-rekognition.md](../adr/20260603-nsfw-moderation-rekognition.md) | NSFW 判定（`BR-SAFE-001`）に AWS Rekognition Content Moderation を採用する決定 |
| [adr/20260604-nextjs-workers-opennext.md](../adr/20260604-nextjs-workers-opennext.md) | Next.js（client/admin）の Workers 配信アダプタに `@opennextjs/cloudflare`（OpenNext）を採用する決定 |

## 3. ローカル開発環境クイックスタート

> 詳細・前提は [infra/00-overview.md](../GUIDES/infra/00-overview.md) §5 と [infra/02-deployment.md](../GUIDES/infra/02-deployment.md) §4.1 を参照。`apps/` 未実装のため、以下は整備後に有効になる手順。

```bash
# 1) 依存インストール（pnpm ワークスペース）
pnpm install

# 2) コンテナ起動（Docker / docker-compose）
docker compose up -d

# 3) ローカル SQLite にマイグレーション適用
pnpm --filter @app/db migration:up
```

### ローカルポート一覧

| アプリ | 役割 | ポート |
| --- | --- | --- |
| `apps/db` | DB（SQLite） | 55030 |
| `apps/api` | 内部 API（NestJS / GraphQL） | 55031 |
| `apps/client` | 利用者・閲覧者 Web（Next.js） | 55032 |
| `apps/admin` | 管理者コンソール（Next.js） | 55033 |
| `apps/public-api` | 公開 API（NestJS / REST） | 55034 |

- ローカルでは D1 の代わりに SQLite、Amazon SES の代わりに Mailpit を使う。
- パッケージマネージャは pnpm、コンテナは Docker（`node@trixie`）。

## 4. 開発ルールの要点

参加前に [CLAUDE.md](../../CLAUDE.md) と [.claude/rules/](../../.claude/rules/) を確認すること。特に重要な点:

- **文章は日本語**で記述する（ドキュメント・コミットメッセージ・コードコメント）。
- 複数行のコード変更は **AI-DLC フレームワーク**に従う（`.aidlc-rule-details/core-workflow.md`）。
- **テスト駆動開発（TDD）** を徹底し、カバレッジ 80% 以上を維持する。
- Git ワークフローは **Trunk-Based Development**。コミットは Conventional Commits。
- **`apps/` を編集したら、`docs/` の関連ドキュメントと README も必ず更新**する。
- **prod デプロイは人間のみ**。AI エージェントによる prod デプロイは禁止。
- 仕様が矛盾した場合は **`docs/service/features/`（SSoT）を優先**する。

## 5. 関連ドキュメント

- サービス全体の説明（作業者向け）: [README.md](../../README.md)
- 技術選定・ディレクトリ構成・デプロイ方針: [CLAUDE.md](../../CLAUDE.md)
- ビジネスルールの正本: [docs/service/features/](../service/features/)
- インフラ / データベース: [docs/GUIDES/infra/](../GUIDES/infra/) / [docs/GUIDES/db/](../GUIDES/db/)
