# データベースガイド索引 — GenAI Profile Community

SQLite（ローカル）/ Cloudflare D1（dev・prod）と MikroORM を用いたデータベースの設計原則・データモデル・マイグレーション手順をまとめた開発者向けドキュメント群。

> 文字数上限・状態・期限などの**具体値は [docs/service/features/](../../service/features/) が正本（SSoT）**。矛盾時は features/ を優先し、本ガイドを追従させる。
> **現状フェーズ**: `apps/db` はローカル healthcheck 用の最小 dev サーバー（ポート 55030 を開く常駐プロセス）のみ実装済みで、スキーマ・MikroORM の実装は未着手。本ガイドが当面のスキーマ正本となる。

## ドキュメント一覧

| ファイル | 内容 | 主な読者 |
| --- | --- | --- |
| [00-overview.md](./00-overview.md) | DB 全体方針・設計原則・命名規約・ID/時刻/正規化方針・D1 と KV の役割分担 | 全員（まず最初に） |
| [01-data-model.md](./01-data-model.md) | ERD（コア/Trust&Safety/管理者・コンテンツ）・全テーブル定義・インデックス・KV/DO/R2 配置 | バックエンド |
| [02-migrations.md](./02-migrations.md) | MikroORM Migrator 中心の手順・wrangler での D1 適用・expand/contract・ロールバック | バックエンド |

## 読む順番（推奨）

```
00-overview → 01-data-model → 02-migrations
（原則）         （何を持つか）     （どう変えるか）
```

## 関連ドキュメント

- インフラ（D1/KV/R2/Images の配置・経路）: [docs/GUIDES/infra/](../infra/)
- API 設計・規約（内部 GraphQL・公開 REST が `api_keys` 等を利用する側）: [docs/GUIDES/api/](../api/)
- ビジネスルールの正本（各 `BR-*`/`AC-*`）: [docs/service/features/](../../service/features/)
- 用語の定義: [docs/service/glossary.md](../../service/glossary.md)
- オンボーディング索引: [docs/onboardings/README.md](../../onboardings/README.md)
