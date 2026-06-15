# プロフィール共有サービス「GenAI Profile Community」

## このサービスについて

プロフィール共有サービス。
会員登録後、アイコン画像・名前・職業を入力できる、

## オンボーディングガイド

プロジェクトに初めてコミットする作業者は[オンボーディングガイド](./docs/onboardings/README.md)を参照されたい。

## 機能

### プロフィール管理

- アイコン画像のアップロード・変更
    - NSFW自動検出及びブロック
- 氏名（ファースト・ラストネーム）の登録
- 職業・職種の登録
- 自己紹介文の入力
- SNSアカウントリンクの登録（X、GitHub、LinkedIn 等）
- プロフィールの公開・非公開切り替え

### アカウント管理

- メールアドレスとパスワードによるユーザー登録・ログイン
- WebAuthn（パスキー）による認証（任意・推奨）
- パスワード変更・リセット
- アカウント情報の編集
- アカウント削除（退会）

### プロフィール共有・閲覧

- 固有URLによる自分のプロフィールページの公開
- 他ユーザーのプロフィール一覧・検索
- 名前・職業・自己紹介による絞り込み検索

### 公開API

- RESTful APIによるプロフィールのCRUD操作
- APIキーによる認証
- 1分あたりのリクエスト数制限（Rate Limiting）

### 管理者機能

- サイト内お知らせやメール通知の配信
- ユーザー一覧・管理
    - 不適切なプロフィールアイコンのモデレーション・削除
- ユーザーによる通報の処理
    - 違反ユーザーの凍結
- 凍結されたユーザーによる解除リクエスト審査
- 管理者アカウント一覧・管理
    - 権限設定
    - WebAuthn（パスキー）による管理者認証（任意・推奨）
- 公開APIキーの管理
    - 全キー共通レート制限の変更
- サービス利用統計の閲覧
- ヘルプ記事のマークダウン編集
- 問い合わせへの対応
- 利用規約やプライバシーポリシーの編集・版管理
- 監査ログの閲覧

## 開発状況

- **内部 GraphQL API（`apps/api`）**: プロフィール共有のコアドメイン（プロフィールの取得・一覧/検索・編集・公開設定・ハンドル・SNS リンク）を実装済み。構造は[コードマップ](./docs/CODEMAPS/api.md)、設計規約は[API ドキュメント](./docs/GUIDES/api/)を参照。
  - 開発: `pnpm --filter @app/api dev`（`:48031`）／ テスト: `pnpm --filter @app/api test` ／ サンプル投入: `pnpm --filter @app/api seed`
- その他のアプリ（`apps/public-api`・`apps/client`・`apps/admin` など）と、`apps/api` の他ドメイン（アカウント認証・API キー・管理者機能ほか）は順次実装予定。変更履歴は [CHANGELOG.md](./CHANGELOG.md) を参照。

## Special Thanks

### 開発ツール

Claude Code
VSCode

### ソースコード管理

Git
GitHub

### Claude拡張機能

- [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) by Affaan Mustafa ... The agent harness performance optimization system.
- [AI-DLC Workflows](https://github.com/awslabs/aidlc-workflows) by AWS Labs ... AI-Driven Life Cycle (AI-DLC) adaptive workflow steering rules for AI coding agents.
- [Skills](https://github.com/anthropics/skills) by Anthropics ... Skills that demonstrate what's possible with Claude's skills system.
- [Agent Skills](https://github.com/openai/skills) by OpenAI ... Skills Catalog for Codex.
- [Awesome GitHub Copilot](https://github.com/github/awesome-copilot) by GitHub ... A community-created collection of custom agents, instructions, skills, hooks, workflows, and plugins to supercharge your GitHub Copilot experience.
