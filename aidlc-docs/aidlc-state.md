# AI-DLC 進捗状態 — GenAI Profile Community

本ファイルは AI-DLC ワークフローのステージ進捗を追跡する正本である（[.aidlc-rule-details/core-workflow.md](../.aidlc-rule-details/core-workflow.md)）。

## ワークスペース種別

- **Brownfield**: 既存のモノレポに `apps/api`（内部 GraphQL API）の実装を追加する。
- 既存実装: `apps/db`（healthcheck 用 dev サーバーのみ）。`apps/api` は Dockerfile のみで未実装。
- 設計仕様の正本: `docs/`（features = ビジネスルール SSoT、GUIDES = 設計規約）は実装に先行して整備済み。

## 作業対象ユニット

| ユニット | 内容 | 状態 |
| --- | --- | --- |
| `api-internal-profile` | 内部 GraphQL API のプロフィール共有コアドメイン（User/Profile/SnsLink） | 完了 |
| `public-api-rest` | 公開 REST API（API キー認証・スコープ・本人フル CRUD・他者公開分 Read・レート制限・OpenAPI） | 完了 |
| `admin-console` | 管理者コンソール（`apps/frontend-lib` 共通基盤＋`apps/admin` Next.js＋`apps/api` 管理者バックエンド）。範囲は admin 仕様 §2-5 ＋ §08 コンテンツ全部。 | 完了（§2-5＋認証/WebAuthn＋§08 コンテンツ） |

### ステージ進捗（`admin-console`）

| 区分 | 内容 | 状態 |
| --- | --- | --- |
| frontend-lib 基盤（トークン/ユーティリティ/プリミティブ/Storybook） | ✅ 完了（57 テスト GREEN） |
| api 管理者ドメイン/ユースケース（RBAC/監査/モデレーション/しきい値/認証/WebAuthn） | ✅ 完了（TDD） |
| api 管理者インターフェース（GraphQL/永続化/Argon2id/セッション/WebAuthn 検証） | ✅ 完了（統合テスト含む 199 テスト GREEN） |
| admin 基盤・シェル・ログイン・ダッシュボード | ✅ 完了（next build 成功） |
| ガバナンス画面（ユーザー/モデレーション/通報/解除/APIキー/監査/管理者権限） | ✅ 完了 |
| WebAuthn パスキー UI（ログイン/セキュリティ設定） | ✅ 完了 |
| §08 コンテンツ＆コミュニケーション（お知らせ/メール/ヘルプ/問い合わせ/規約版管理） | ✅ 完了（ドメイン/ユースケース/永続化/GraphQL/画面・統合テスト含む） |

> リポジトリ全体 292 テスト GREEN（frontend-lib 57 / api 228 / admin 7）。typecheck・lint・各 build 成功。
> 本番化の差し替え（KV/SES+MJML/Workers 互換 Argon2id/公開面サニタイズ・問い合わせ送信フォーム）は後続。

> `api-internal-profile`: サービスの中核「プロフィールの CRUD・公開/共有」を内部 GraphQL API として End-to-End に実装する縦スライス。
> `public-api-rest`: 同じプロフィール共有コアを **外部開発者向けの公開 REST API** として End-to-End に実装する縦スライス（`apps/public-api`、`:48034`）。エンドポイント・スコープ・エラー・レート制限の正本は [features/05-public-api.md](../docs/service/features/05-public-api.md)。
> 他ドメイン（アカウント認証フロー・Trust&Safety・管理者コンソール・コンテンツ配信・NSFW 判定・メール送信・API キーの発行/失効 UI）は後続ユニットとして範囲外とする（[workflow-plan-public-api.md](./inception/plans/workflow-plan-public-api.md) §範囲）。

## ステージ進捗（`api-internal-profile`）

| フェーズ | ステージ | 実施 | 深度 | 備考 |
| --- | --- | --- | --- | --- |
| INCEPTION | Workspace Detection | ✅ | — | Brownfield 判定。`apps/api` 未実装 |
| INCEPTION | Reverse Engineering | スキップ | — | 設計成果物（`docs/`）が既存のため再生成不要 |
| INCEPTION | Requirements Analysis | ✅ | minimal | [requirements.md](./inception/requirements/requirements.md) |
| INCEPTION | User Stories | スキップ | — | features/ の `AC-*` を受け入れ条件の正本として直接利用 |
| INCEPTION | Workflow Planning | ✅ | standard | [workflow-plan.md](./inception/plans/workflow-plan.md) |
| INCEPTION | Application Design | ✅ | minimal | 層対応は GUIDES/coding を踏襲（再掲しない） |
| INCEPTION | Units Generation | ✅ | minimal | 単一ユニット `api-internal-profile` |
| CONSTRUCTION | Functional Design | ✅ | minimal | features/ を正本とし設計値を複製しない |
| CONSTRUCTION | NFR Requirements | ✅ | minimal | 検証境界・N+1・カーソル・秘匿は GUIDES に既定 |
| CONSTRUCTION | Code Generation | ✅ | — | [code/plan.md](./construction/api-internal-profile/code/plan.md) |
| CONSTRUCTION | Build and Test | ✅ | — | Jest 単体・統合。TDD（RED→GREEN→REFACTOR） |

## ステージ進捗（`public-api-rest`）

| フェーズ | ステージ | 実施 | 深度 | 備考 |
| --- | --- | --- | --- | --- |
| INCEPTION | Workspace Detection | ✅ | — | Brownfield 継続。`apps/public-api` は Dockerfile のみで未実装 |
| INCEPTION | Reverse Engineering | スキップ | — | `apps/api` 実装と `docs/` を既存知識として参照（再生成不要） |
| INCEPTION | Requirements Analysis | ✅ | minimal | 正本は features/05-public-api.md。本ユニットの解釈は audit.md に記録 |
| INCEPTION | User Stories | スキップ | — | features/ の `AC-API-*` を受け入れ条件の正本として直接利用 |
| INCEPTION | Workflow Planning | ✅ | standard | [workflow-plan-public-api.md](./inception/plans/workflow-plan-public-api.md) |
| INCEPTION | Application Design | ✅ | minimal | クリーンアーキ層は `apps/api` と同型。差分は API キー認証・スコープ・REST 表現 |
| INCEPTION | Units Generation | ✅ | minimal | 単一ユニット `public-api-rest` |
| CONSTRUCTION | Functional Design | ✅ | minimal | features/ を正本とし設計値を複製しない |
| CONSTRUCTION | NFR Requirements | ✅ | minimal | レート制限・秘匿・検証境界は GUIDES/ADR に既定 |
| CONSTRUCTION | Code Generation | ✅ | — | [code/plan.md](./construction/public-api-rest/code/plan.md) |
| CONSTRUCTION | Build and Test | ✅ | — | Jest 単体・統合。TDD（RED→GREEN→REFACTOR） |

> ドメイン層の共有方針: `apps/public-api` 内に複製する（独立アプリ・別 Worker）。経緯は [ADR 20260617-public-api-domain-duplication](../docs/adr/20260617-public-api-domain-duplication.md)。

## 実行モード

- 利用者の明示指示（「作業用ブランチで複数コミットに分割し自動コミット、完了後 main へマージ」）に基づき、**承認ゲートで都度停止せず自律実行**する。監査証跡は [audit.md](./audit.md) に記録する。
