# コーディングガイド索引 — GenAI Profile Community

コーディング原則・アーキテクチャ設計・静的解析/整形/コミット規約、及び主要ツール（Docker/NestJS/Tailwind/MikroORM）別の実装規約をまとめた開発者向けドキュメント群。
フロントエンド（`client`/`admin`）・バックエンド（`api`/`public-api`）・共有コードに共通して適用する。

> **Next.js / React 固有のコーディングルールは Skills（ECC のフロントエンド系スキル）で定義済み**のため、本ガイドでは扱わない。フロントの構造・状態管理は [01-architecture.md](./01-architecture.md) §3、スタイリングは [05-tailwind.md](./05-tailwind.md) を参照する。

> コーディング規約の一次情報は [.claude/rules/ecc-common/coding-style.md](../../../.claude/rules/ecc-common/coding-style.md) と [.claude/rules/ecc-web/coding-style.md](../../../.claude/rules/ecc-web/coding-style.md)、技術選定の正本は [CLAUDE.md](../../../CLAUDE.md)、業務仕様の正本（SSoT）は [docs/service/features/](../../service/features/)。矛盾した場合はそれらを優先し、本ガイドを追従させる。
> **現状フェーズ**: `apps/` 配下は未実装で、本ガイドは実装に先行する設計規約である。

## ドキュメント一覧

| ファイル | 内容 | 主な読者 |
| --- | --- | --- |
| [00-overview.md](./00-overview.md) | コーディング原則の全体像。言語/TypeScript 方針・KISS/DRY/YAGNI・イミュータビリティ・ファイル構成・命名・エラー処理・境界検証 | 全員（まず最初に） |
| [01-architecture.md](./01-architecture.md) | アーキテクチャ設計。モノレポ・バックエンドのクリーンアーキテクチャ・フロントエンドの責務分割と状態管理・境界とアプリ分離 | 全員 |
| [02-lint-format-commit.md](./02-lint-format-commit.md) | 静的解析・整形・コミット規約。ESLint(Flat Config)/Prettier/eslint-config-prettier・Husky + lint-staged・Commitlint・Gitleaks/TruffleHog・CI 品質ゲート | 全員 |
| [03-docker.md](./03-docker.md) | Docker 構成規約。ローカル開発専用・`node@trixie`・Dockerfile/`docker-compose.yaml`・ポート・Mailpit・秘匿 | 全員 |
| [04-nestjs.md](./04-nestjs.md) | NestJS 実装規約（`api`/`public-api`）。モジュール/DI・リクエストパイプライン（ガード/パイプ/インターセプタ/フィルタ）・Throttler・Hono | バックエンド |
| [05-tailwind.md](./05-tailwind.md) | Tailwind CSS 規約（`client`/`admin`）。デザイントークン・ユーティリティ抽象化・レスポンシブ・モーション・shadcn/ui・アンチテンプレート | フロントエンド |
| [06-mikroorm.md](./06-mikroorm.md) | MikroORM 実装規約。エンティティ/命名戦略・EntityManager(fork)・トランザクション・N+1/カーソル・マイグレーション | バックエンド |

## 読む順番（推奨）

```
00-overview → 01-architecture → 02-lint-format-commit → ┬→ 03-docker（全員）
（原則・規約）   （構造・依存方向）    （ツールと品質ゲート）      ├→ 04-nestjs / 06-mikroorm（バックエンド）
                                                        └→ 05-tailwind（フロントエンド）
（00〜03 は全員。04〜06 は担当領域に応じて）
```

## SSoT / 関連ドキュメント参照マップ

本ガイドは具体値（しきい値・文字数・状態列挙など）を持たず、以下を正本として参照する。

| 知りたいこと | 正本（参照先） |
| --- | --- |
| 一般的なコーディング規約（イミュータビリティ・命名・ファイル粒度・エラー処理） | [ecc-common/coding-style.md](../../../.claude/rules/ecc-common/coding-style.md) |
| フロントエンド固有のスタイル（ファイル整理・CSS トークン・セマンティック HTML） | [ecc-web/coding-style.md](../../../.claude/rules/ecc-web/coding-style.md) |
| 技術選定（フレームワーク・ライブラリ・ツール） | [CLAUDE.md](../../../CLAUDE.md) |
| 文字数/件数/状態/しきい値などの業務具体値 | [docs/service/features/](../../service/features/) `BR-*` |
| 検証・正規化・公開ゲート・エラー写像の横断ルール | [00-common-rules.md](../../service/features/00-common-rules.md) `BR-COMMON-*` |
| API の設計規約（GraphQL/REST・エラー写像・ページング） | [docs/GUIDES/api/](../api/) |
| DB の命名規約・ID/時刻方針・正規化 | [docs/GUIDES/db/00-overview.md](../db/00-overview.md) |
| アプリ構成・経路・レート制限層 | [docs/GUIDES/infra/](../infra/) |

## 関連ドキュメント

- テスト方針（TDD・カバレッジ・テスト種別）: [docs/GUIDES/testing/](../testing/)
- API 設計規約: [docs/GUIDES/api/](../api/)
- データベース設計: [docs/GUIDES/db/](../db/)
- インフラ・経路: [docs/GUIDES/infra/](../infra/)
- ビジネスルールの正本: [docs/service/features/](../../service/features/)
- オンボーディング索引: [docs/onboardings/README.md](../../onboardings/README.md)
