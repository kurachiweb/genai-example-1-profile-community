# ワークフロー計画 — 管理者コンソール（admin-console ユニット）

> Trunk-Based Development・短命ブランチ `feature/admin-console`。各ユニットを複数コミットに分割し、完了後 `main` へマージする。

## 実行ユニット（縦スライス）

| # | ユニット | 主成果物 | 依存 |
| --- | --- | --- | --- |
| 1 | frontend-lib 基盤 | `apps/frontend-lib`：design トークン（tokens.css・light/dark）、`cn()`、日時/名前/書記素ユーティリティ、shadcn ベースのプリミティブ、Storybook(Vite)、Jest/RTL | — |
| 2 | api 管理者ドメイン/ユースケース | AdminAccount/AuditLog/Suspension/Report/UnfreezeRequest/ApiKey/Announcement/Help/Policy/Inquiry の domain＋usecase（純粋層・TDD） | — |
| 3 | api 管理者インターフェース | GraphQL 管理者サーフェス、認証（パスワード/セッション/CSRF/WebAuthn）、RBAC ガード、永続化（MikroORM entities）、Gateway 実装 | 2 |
| 4 | admin Next.js 基盤・シェル | Next.js App Router、Tailwind＋トークン、shadcn、Apollo Client、ESLint/Prettier/Jest/RTL、左固定サイドバーシェル、テーマ切替 | 1,3 |
| 5 | 認証画面 | ログイン（メール＋パスワード）、WebAuthn 登録/認証、セッション/CSRF 配線 | 4 |
| 6 | ガバナンス画面 | ダッシュボード（統計）、ユーザー一覧・詳細、モデレーション（凍結/解除/アイコン削除）、通報処理、解除リクエスト審査 | 5 |
| 7 | 運用画面 | API キー運用・しきい値、監査ログ閲覧、管理者アカウント・権限管理 | 5 |
| 8 | §08 コンテンツ | お知らせ、メール通知、ヘルプ記事、問い合わせ対応、規約版管理 | 5 |

## ステージ深度

- Functional Design: minimal（features/ を正本に複製しない）。
- NFR: minimal（検証境界・秘匿・認可集約は GUIDES/security・clean-architecture スキルに既定）。
- Code Generation: 各ユニットで TDD。
- Build and Test: 全ユニット後にまとめて実施。

## 画面デザインの確認方針

各画面（ログイン・ダッシュボード・ユーザー一覧/詳細・各モデレーション・監査・コンテンツ）のレイアウトとパーツ配置は、実装着手前に AskUserQuestion で確認する（利用者の明示指示）。

## コミット分割方針

1. AI-DLC ドキュメント・計画
2. frontend-lib トークン/ユーティリティ＋テスト
3. frontend-lib プリミティブ＋Storybook
4. api 管理者ドメイン/ユースケース＋テスト
5. api 管理者インターフェース（認証・GraphQL・永続化）
6. admin 基盤・シェル
7. 認証画面
8. ガバナンス画面（複数コミット）
9. 運用画面（複数コミット）
10. §08 コンテンツ（複数コミット）
11. docs/README/CHANGELOG/CODEMAPS 更新

> 各コミットで `apps/` を触れた場合は `docs/` の関連更新を同一作業単位に含める（CLAUDE.md・coding/02 §6）。
