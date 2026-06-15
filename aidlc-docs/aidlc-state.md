# AI-DLC 進捗状態 — GenAI Profile Community

本ファイルは AI-DLC ワークフローのステージ進捗を追跡する正本である（[.aidlc-rule-details/core-workflow.md](../.aidlc-rule-details/core-workflow.md)）。

## ワークスペース種別

- **Brownfield**: 既存のモノレポに `apps/api`（内部 GraphQL API）の実装を追加する。
- 既存実装: `apps/db`（healthcheck 用 dev サーバーのみ）。`apps/api` は Dockerfile のみで未実装。
- 設計仕様の正本: `docs/`（features = ビジネスルール SSoT、GUIDES = 設計規約）は実装に先行して整備済み。

## 今回の作業対象ユニット

| ユニット | 内容 | 状態 |
| --- | --- | --- |
| `api-internal-profile` | 内部 GraphQL API のプロフィール共有コアドメイン（User/Profile/SnsLink） | 完了 |

> サービスの中核「プロフィールの CRUD・公開/共有」を内部 GraphQL API として End-to-End に実装する縦スライス。
> 他ドメイン（アカウント認証フロー・公開 REST API・API キー・Trust&Safety・管理者コンソール・コンテンツ配信・NSFW 判定・メール送信）は後続ユニットとして本ユニットの範囲外とする（[workflow-plan.md](./inception/plans/workflow-plan.md) §範囲）。

## ステージ進捗

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

## 実行モード

- 利用者の明示指示（「作業用ブランチで複数コミットに分割し自動コミット、完了後 main へマージ」）に基づき、**承認ゲートで都度停止せず自律実行**する。監査証跡は [audit.md](./audit.md) に記録する。
