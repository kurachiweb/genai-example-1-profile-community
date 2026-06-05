# インフラガイド索引 — GenAI Profile Community

Cloudflare を主軸としたインフラ構成・ネットワーク・デプロイ・ログ管理の開発者向けドキュメント群。

> ビジネスルールの正本（SSoT）は [docs/service/features/](../../service/features/)、技術選定・デプロイ方針の正本は [CLAUDE.md](../../../CLAUDE.md)。矛盾時はそれらを優先し、本ガイドを追従させる。
> **現状フェーズ**: `apps/` は未実装で、本ガイドは実装に先行する設計仕様である。

## ドキュメント一覧

| ファイル | 内容 | 主な読者 |
| --- | --- | --- |
| [00-overview.md](./00-overview.md) | インフラ全体像・アプリ構成・Cloudflare リソース一覧・環境（local/dev/prod） | 全員（まず最初に） |
| [01-network-architecture.md](./01-network-architecture.md) | ネットワークトポロジ・リクエストフロー・セッション分離・レート制限の二層構造 | バックエンド・SRE |
| [02-deployment.md](./02-deployment.md) | CI/CD パイプライン・環境別デプロイ手順・Terraform・ロールバック | 全エンジニア |
| [03-logging-monitoring.md](./03-logging-monitoring.md) | LogTape 構造化ログ・Sentry・監査ログ・保持方針・アラート | バックエンド・運用 |

## 読む順番（推奨）

```
00-overview → 01-network-architecture → 02-deployment → 03-logging-monitoring
（全体像）       （構成と通信）              （出し方）         （見張り方）
```

## 関連ドキュメント

- データベース設計: [docs/GUIDES/db/](../db/)
- API 設計・規約（内部 GraphQL・公開 REST）: [docs/GUIDES/api/](../api/)
- 横断ビジネスルール（認証・公開ゲート・レート制限）: [00-common-rules.md](../../service/features/00-common-rules.md)
- 公開 API 仕様: [05-public-api.md](../../service/features/05-public-api.md)
- オンボーディング索引: [docs/onboardings/README.md](../../onboardings/README.md)
