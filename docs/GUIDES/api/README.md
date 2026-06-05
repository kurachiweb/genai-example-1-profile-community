# API ガイド索引 — GenAI Profile Community

内部 GraphQL API（`apps/api`）と公開 REST API（`apps/public-api`）の設計原則・実装規約・開発者向け利用ガイドをまとめた開発者向けドキュメント群。

> 業務仕様（エンドポイント・キースコープ・しきい値・エラーコード値・受け入れ条件）の正本（SSoT）は [docs/service/features/05-public-api.md](../../service/features/05-public-api.md) と [00-common-rules.md](../../service/features/00-common-rules.md)、技術選定の正本は [CLAUDE.md](../../../CLAUDE.md)。矛盾した場合はそれらを優先し、本ガイドを追従させる。
> **現状フェーズ**: `apps/api`・`apps/public-api` は未実装で、本ガイドは実装に先行する設計仕様である。

## ドキュメント一覧

| ファイル | 内容 | 主な読者 |
| --- | --- | --- |
| [00-overview.md](./00-overview.md) | API 全体方針・2 面の分離・横断する設計原則（検証/認可/公開ゲート/エラー写像/ページング/レート制限層/観測性）・バージョニング | 全員（まず最初に） |
| [01-graphql-internal.md](./01-graphql-internal.md) | 内部 GraphQL API（`apps/api`）の設計規約。スキーマ命名・接続・エラー表現・DataLoader・型生成・探索ツール | バックエンド・フロントエンド |
| [02-public-rest-api.md](./02-public-rest-api.md) | 公開 REST API（`apps/public-api`）の設計規約。URL/エンベロープ/エラー写像/認可ガード/レート制限/OpenAPI の実装規約と API 固有セキュリティ | バックエンド |
| [03-public-api-developer-guide.md](./03-public-api-developer-guide.md) | 公開 API 開発者向け利用ガイド。キー発行→疎通のクイックスタート・エラー対処・代表レシピ | 外部開発者・埋め込み実装者 |

## 2 つの API 面（早見表）

本サービスは目的の異なる 2 つの API を**別アプリ・別 Worker・別認証・別境界**で提供する。経路の詳細は [infra/01-network-architecture.md](../infra/01-network-architecture.md) §1 を参照。

| 観点 | 内部 API | 公開 API |
| --- | --- | --- |
| 種別 | GraphQL | REST |
| アプリ | `apps/api`（NestJS + Apollo Server） | `apps/public-api`（NestJS） |
| 消費者 | `client` / `admin`（Next.js） | 外部開発者・自サイト埋め込み |
| 認証 | HTTPS-Only Cookie セッション（WebAuthn 推奨） | API キー（`Authorization: Bearer`） |
| ベースパス | （内部のみ・`client`/`admin` から到達） | `/api/public/v1` |
| 探索手段 | GraphQL Playground（dev/local 限定） | Swagger UI（OpenAPI） |
| 主担当ファイル | [01-graphql-internal.md](./01-graphql-internal.md) | [02-public-rest-api.md](./02-public-rest-api.md) / [03-public-api-developer-guide.md](./03-public-api-developer-guide.md) |

## 読む順番（推奨）

```
00-overview → ┬→ 01-graphql-internal              → （内部 API を実装/消費する場合）
              └→ 02-public-rest-api → 03-developer-guide → （公開 API を実装/利用する場合）
（全体方針・原則）   （各面の設計規約）        （公開 API の使い方）
```

## SSoT / 関連ドキュメント参照マップ

本ガイドは具体値を持たず、以下を正本として参照する。

| 知りたいこと | 正本（参照先） |
| --- | --- |
| 公開 API のエンドポイント・キースコープ・エラーコード・受け入れ条件 | [05-public-api.md](../../service/features/05-public-api.md) `BR-API-*` / `AC-API-*` |
| 共通エンベロープ・レート制限階層・検証/正規化・監査・公開ゲート | [00-common-rules.md](../../service/features/00-common-rules.md) `BR-COMMON-*` |
| ネットワーク経路・レート制限多層図・内部通信（DataLoader） | [infra/01-network-architecture.md](../infra/01-network-architecture.md) §1・§3・§5 |
| `api_keys` テーブル・インデックス・KV/DO/R2 配置 | [db/01-data-model.md](../db/01-data-model.md) §5.4・§6・§7 |
| キースコープ・DO レート制限カウンタ採用の経緯 | [ADR scopes](../../adr/20260605-public-api-key-scopes.md) / [ADR DO](../../adr/20260604-public-api-rate-limit-durable-objects.md) |
| 用語の定義（公開 API・API キー・スコープ・エンベロープ 等） | [glossary.md](../../service/glossary.md) §6 |

## 関連ドキュメント

- インフラ（経路・レート制限多層・内部通信）: [docs/GUIDES/infra/](../infra/)
- データベース（`api_keys`・インデックス・KV/DO 配置）: [docs/GUIDES/db/](../db/)
- ビジネスルールの正本: [docs/service/features/](../../service/features/)
- オンボーディング索引: [docs/onboardings/README.md](../../onboardings/README.md)
