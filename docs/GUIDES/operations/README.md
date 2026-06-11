# 運用ガイド索引 — GenAI Profile Community

可用性/信頼性の維持・障害対応・ロールバック判断・問い合わせ駆動調査をまとめた運用者向けドキュメント群。
デプロイ・ログ・監視の**実装**は [docs/GUIDES/infra/](../infra/) が正本であり、本ガイドはそれを前提とした運用手順に徹する。

> **正本（SSoT）**: デプロイ/ロールバックの実装は [infra/02-deployment.md](../infra/02-deployment.md)、ログ/監視は [infra/03-logging-monitoring.md](../infra/03-logging-monitoring.md)、業務仕様は [docs/service/features/](../../service/features/)、技術選定・デプロイ方針は [CLAUDE.md](../../../CLAUDE.md)。矛盾時はそれらを優先し、本ガイドを追従させる。
> **セキュリティ運用は別系統**: セキュリティ監視・脆弱性管理・セキュリティインシデント対応は [docs/GUIDES/security/](../security/) が正本。本ディレクトリは可用性/信頼性・問い合わせ運用に集中する。
> **現状フェーズ**: `apps/` 配下は未実装で、本ガイドは実装に先行する運用設計である。

## ドキュメント一覧

| ファイル | 内容 | 主な読者 |
| --- | --- | --- |
| [00-overview.md](./00-overview.md) | 運用の全体像・operations/security/infra の責務分担・環境前提・監視と検知・定期作業 | 全員（まず最初に） |
| [01-incident-response.md](./01-incident-response.md) | 障害対応。深刻度区分（SEV1〜3）・対応フロー・ロールバック判断・インシデント告知・事後レビュー | 運用・全エンジニア |
| [02-runbooks.md](./02-runbooks.md) | コンポーネント別ランブック（Worker/D1/Rekognition/レート制限/メール/画像/KV/濫用） | 運用・バックエンド |
| [03-inquiry-driven-investigation.md](./03-inquiry-driven-investigation.md) | 問い合わせ・通報を起点とした調査手順（相関 ID・監査ログ・プライバシー配慮） | 運用・サポート |

## 読む順番（推奨）

```
00-overview → 01-incident-response → 02-runbooks → 03-inquiry-driven-investigation
（全体像・責務）   （障害対応の型）          （シナリオ別手順）      （問い合わせ起点の調査）
```

## 責務分担（早見表）

| ガイド | 守備範囲 | 正本の所在 |
| --- | --- | --- |
| operations/（本ディレクトリ） | 可用性/信頼性のインシデント・ランブック・問い合わせ調査 | 本ガイド（実装は infra/ を参照） |
| security/ | 脅威モデル・認証認可・セキュリティ監視&対応・脆弱性管理 | [docs/GUIDES/security/](../security/) |
| infra/ | デプロイ・ロールバック・ログ・監視の実装 | [docs/GUIDES/infra/](../infra/) |

## 関連ドキュメント

- デプロイ・CI/CD・ロールバック・Terraform: [infra/02-deployment.md](../infra/02-deployment.md)
- ログ・監視・監査ログ・アラート: [infra/03-logging-monitoring.md](../infra/03-logging-monitoring.md)
- セキュリティガイド: [docs/GUIDES/security/](../security/)
- 通報・凍結・解除リクエスト: [06-trust-and-safety.md](../../service/features/06-trust-and-safety.md)
- 問い合わせ・お知らせ・ヘルプ・規約: [08-content-and-comms.md](../../service/features/08-content-and-comms.md)
- オンボーディング索引: [docs/onboardings/README.md](../../onboardings/README.md)
