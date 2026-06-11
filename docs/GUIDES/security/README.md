# セキュリティガイド索引 — GenAI Profile Community

脅威モデル・認証認可設計・アプリケーション層の防御・セキュリティ監視とインシデント対応をまとめた開発者向けドキュメント群。
利用者（client）・管理者（admin）・内部 API（api）・公開 API（public-api）に横断して適用する。

> **正本（SSoT）の優先順位**: 業務仕様（公開ゲート・レート制限のしきい値・セッション仕様・監査対象など）の正本は [docs/service/features/](../../service/features/)、コーディング規約としてのセキュリティ一次情報は [.claude/rules/ecc-common/security.md](../../../.claude/rules/ecc-common/security.md)・[.claude/rules/ecc-web/security.md](../../../.claude/rules/ecc-web/security.md)、技術選定・セキュリティ方針の正本は [CLAUDE.md](../../../CLAUDE.md)。矛盾時はそれらを優先し、本ガイドを追従させる。**本ガイドは値を再掲せず、設計と正本参照に徹する。**
> **現状フェーズ**: `apps/` 配下は未実装で、本ガイドは実装に先行する設計仕様である。

## ドキュメント一覧

| ファイル | 内容 | 主な読者 |
| --- | --- | --- |
| [00-overview.md](./00-overview.md) | セキュリティ方針・脅威モデル・多層防御の全体像・SSoT 参照マップ・operations/infra との責務分担 | 全員（まず最初に） |
| [01-authn-authz.md](./01-authn-authz.md) | 認証認可設計。三系統の認証分離・Argon2id/WebAuthn・セッション・RBAC・所有権ベース・実効公開ゲート・API キー認証 | バックエンド・SRE |
| [02-application-security.md](./02-application-security.md) | アプリ層の防御。セキュリティヘッダ/CSP・XSS/サニタイズ・CSRF・入力検証/正規化・アップロード安全性・CORS・シークレット | 全エンジニア |
| [03-monitoring-and-response.md](./03-monitoring-and-response.md) | セキュリティ監視・濫用検知・依存脆弱性管理（Dependabot + pnpm audit）・シークレットローテーション・セキュリティインシデント対応 | バックエンド・運用 |

## 読む順番（推奨）

```
00-overview → 01-authn-authz → 02-application-security → 03-monitoring-and-response
（方針・脅威・全体像）  （誰が何をできるか）      （どう守るか）              （どう見張り・対応するか）
```

## SSoT / 関連ドキュメント参照マップ

| 知りたいこと | 正本（参照先） |
| --- | --- |
| 認証方式・セッション・パスワード・WebAuthn | `BR-COMMON-001`/`002`/`003`/`016`（[00-common-rules.md](../../service/features/00-common-rules.md)） |
| RBAC ロール・権限マトリクス | `BR-ADMIN-002`（[07-admin-console.md](../../service/features/07-admin-console.md)） |
| 実効公開ゲート（公開面の認可） | `BR-COMMON-007` |
| API キー・スコープ（read/full） | `BR-API-001`/`001b`（[05-public-api.md](../../service/features/05-public-api.md)） |
| セキュリティヘッダ/CSP/XSS/CSRF（一次情報） | [ecc-web/security.md](../../../.claude/rules/ecc-web/security.md)・`BR-COMMON-004` |
| 入力検証・正規化 | `BR-COMMON-008`/`009` |
| レート制限の多層・しきい値 | `BR-COMMON-010`・[infra/01-network-architecture.md](../infra/01-network-architecture.md) §3 |
| ログ・監査ログ・監視の実装 | [infra/03-logging-monitoring.md](../infra/03-logging-monitoring.md)・`BR-COMMON-013`/`014` |
| 可用性インシデント対応・告知 | [operations/01-incident-response.md](../operations/01-incident-response.md) |

## 関連ドキュメント

- インフラ・ネットワーク・監視・デプロイ: [docs/GUIDES/infra/](../infra/)
- 運用・障害対応・問い合わせ駆動調査: [docs/GUIDES/operations/](../operations/)
- API 設計規約（認可ガード・キー検証・CORS）: [docs/GUIDES/api/](../api/)
- データモデル（監査ログ・KV/DO 配置・キーハッシュ）: [docs/GUIDES/db/](../db/)
- ビジネスルール・受け入れ条件の正本: [docs/service/features/](../../service/features/)
- オンボーディング索引: [docs/onboardings/README.md](../../onboardings/README.md)
