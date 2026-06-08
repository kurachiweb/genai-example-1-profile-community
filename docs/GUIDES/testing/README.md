# テストガイド索引 — GenAI Profile Community

テスト戦略・テスト駆動開発（TDD）・カバレッジ方針・テスト種別ごとの規約をまとめた開発者向けドキュメント群。
フロントエンド（`client`/`admin`）・バックエンド（`api`/`public-api`）・共有コードに共通して適用する。

> テスト要件の一次情報は [.claude/rules/ecc-common/testing.md](../../../.claude/rules/ecc-common/testing.md) と [.claude/rules/ecc-web/testing.md](../../../.claude/rules/ecc-web/testing.md)、技術選定の正本は [CLAUDE.md](../../../CLAUDE.md)、テスト対象の業務仕様（受け入れ条件）の正本（SSoT）は [docs/service/features/](../../service/features/)。矛盾した場合はそれらを優先し、本ガイドを追従させる。
> **現状フェーズ**: `apps/` 配下は未実装で、本ガイドは実装に先行するテスト設計方針である。

## ドキュメント一覧

| ファイル | 内容 | 主な読者 |
| --- | --- | --- |
| [00-overview.md](./00-overview.md) | テスト戦略の全体像。TDD サイクル・テスト種別・カバレッジ 80%・正確性優先のテスト配分・決定性・ツール対応 | 全員（まず最初に） |
| [01-unit-integration.md](./01-unit-integration.md) | 単体・統合テストの規約。Jest・React Testing Library・jest-axe・Supertest・MikroORM/DB テスト・モック/フェイク戦略 | 全員 |
| [02-e2e.md](./02-e2e.md) | E2E テストの規約。Playwright・重要フロー・Page Object・ビジュアル回帰/アクセシビリティ（補助）・成果物・CI | 全員 |

## テスト戦略の方針（早見表）

本サービスは**プロフィール CRUD・フォーム・公開 API 中心**であり、テストは**正確性（ロジック・業務ルール）を最優先**に配分する。ビジュアル回帰・アクセシビリティ・パフォーマンスは重要画面に絞って補助的に実施する（詳細は [00-overview.md](./00-overview.md) §3）。

| 観点 | 方針 |
| --- | --- |
| 開発手法 | テスト駆動開発（TDD）必須。RED → GREEN → REFACTOR |
| 最低カバレッジ | **80%**（CI で未満は失敗、[ecc-common/testing.md](../../../.claude/rules/ecc-common/testing.md)） |
| 必須テスト種別 | 単体・統合・E2E（すべて） |
| 重点 | 正確性優先（単体・統合・公開 API・認証/CRUD の E2E が主、ビジュアル/a11y/perf は補助） |
| 決定性 | 外部 I/O はスタブ/フェイク（Rekognition 決定論的スタブ・SES→Mailpit・固定時刻/ULID）。ネットワーク非依存 |

## 読む順番（推奨）

```
00-overview → 01-unit-integration → 02-e2e
（戦略・配分・決定性）  （単体・統合の規約）     （E2E と補助テスト）
```

## SSoT / 関連ドキュメント参照マップ

| 知りたいこと | 正本（参照先） |
| --- | --- |
| テスト要件（カバレッジ・TDD・AAA・命名） | [ecc-common/testing.md](../../../.claude/rules/ecc-common/testing.md) |
| フロント固有のテスト（ビジュアル回帰・a11y・レスポンシブ・E2E 形） | [ecc-web/testing.md](../../../.claude/rules/ecc-web/testing.md) |
| テスト対象の受け入れ条件（Given/When/Then） | [docs/service/features/](../../service/features/) `AC-*` |
| テスト用ツールの選定 | [CLAUDE.md](../../../CLAUDE.md) |
| 検証・正規化・公開ゲート・エラー写像のルール | [00-common-rules.md](../../service/features/00-common-rules.md) `BR-COMMON-*` |
| NSFW 判定の決定論的スタブ | [ADR 20260603-nsfw-moderation-rekognition](../../adr/20260603-nsfw-moderation-rekognition.md) |
| CI パイプラインでのテスト実行位置 | [coding/02-lint-format-commit.md](../coding/02-lint-format-commit.md) §7・[infra/02-deployment.md](../infra/02-deployment.md) |

## 関連ドキュメント

- コーディング規約・アーキテクチャ（テスト容易性の前提）: [docs/GUIDES/coding/](../coding/)
- API 設計規約（テスト対象の境界・エラー写像）: [docs/GUIDES/api/](../api/)
- データベース設計（テスト DB・正規化）: [docs/GUIDES/db/](../db/)
- ビジネスルール・受け入れ条件の正本: [docs/service/features/](../../service/features/)
- オンボーディング索引: [docs/onboardings/README.md](../../onboardings/README.md)
