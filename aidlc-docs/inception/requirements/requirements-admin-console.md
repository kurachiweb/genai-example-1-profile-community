# 要件分析 — 管理者コンソール（admin-console ユニット）

> 正本（SSoT）は `docs/service/features/`。本書は実装範囲の解釈と非機能要件の確認に限定し、業務値を複製しない。

## 1. 目的

運営チームが利用する管理者コンソール（`apps/admin`・Next.js・`:48033`）を、利用者アプリとは別アプリ・別セッションで提供する（`BR-COMMON-002`）。
共通フロントエンド資産は `apps/frontend-lib` に集約し、`apps/client` でも再利用可能にする。
管理者操作を支える内部 GraphQL（`apps/api`）の管理者向けサーフェスを新設する。

## 2. 機能範囲（ユーザー承認: §08 含む全部）

| 区分 | 内容 | 正本 |
| --- | --- | --- |
| 認証・RBAC | 管理者ログイン（メール＋パスワード Argon2id）、本番水準セッション（8h/アイドル 30 分）、CSRF、WebAuthn パスキー登録/認証、ロール（super_admin/moderator/support/viewer） | `BR-ADMIN-001/002`・`BR-COMMON-002/016`・security/01 |
| ユーザー管理 | 一覧・検索（メール/ハンドル/状態）、詳細（状態・登録日・公開状態・通報件数・APIキー数） | `BR-ADMIN-004` |
| モデレーション | アイコン削除、ユーザー凍結、通報審査・処分、解除リクエスト審査（承認/却下） | `BR-ADMIN-005/006`・`06` |
| API キー運用 | メタ情報閲覧（秘匿値不可）、失効、共通レート制限しきい値変更 | `BR-ADMIN-007/008` |
| 利用統計 | 登録数・実効公開数・アクティブ・通報・凍結・API リクエスト量の集計 | `BR-ADMIN-009` |
| 監査ログ | 追記専用ログの閲覧・絞り込み | `BR-ADMIN-010` |
| §08 コンテンツ | お知らせ、メール通知、ヘルプ記事（Markdown）、問い合わせ対応、規約/プライバシー版管理 | `08` |

## 3. 非機能要件

- **TDD**: RED→GREEN→REFACTOR。純粋層（domain/usecase・utilities）のカバレッジ 80% 以上。
- **アクセシビリティ**: WCAG 2.2 AA。`jsx-a11y` ＋ jest-axe で検証（design/04）。
- **デザイン**: 温かみのある Bento・ライト/ダーク両対応・コーラル差し色（design/00-04）。管理画面は密度高めのテーブル中心（design/02 §6）。
- **セキュリティ**: UI と API の双方で認可強制（`AC-ADMIN-001`）。秘匿値（パスワード・キー値・Cookie・チャレンジ）はログ/監査に出さない（`BR-COMMON-014`）。状態変更は監査ログ記録（`BR-COMMON-013`）。
- **コーディング規約**: `apps/api` の ESLint/Prettier を流用しフロント向けに拡張（タブ・シングルクォート・trailingComma none・printWidth 100）。Stylelint 不採用（coding/02 §3）。

## 4. ローカル実装上の制約

- 本番は Cloudflare KV/D1。ローカルは SQLite（共有 DB）＋インプロセス実装。セッション・WebAuthn チャレンジ・レート制限は **Gateway で抽象化**し、ローカル実装と Workers 実装を差し替え可能にする（clean-architecture）。
- WebAuthn はライブラリ（`@simplewebauthn/server` / `@simplewebauthn/browser`）を用い、車輪の再発明を避ける（暗号処理は自作しない）。
