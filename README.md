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
- **公開 REST API（`apps/public-api`）**: API キー認証による本人プロフィールのフル CRUD・他ユーザーの公開分の取得・カーソル一覧・スコープ（read/full）・キー単位レート制限・OpenAPI/Swagger UI を実装済み。構造は[コードマップ](./docs/CODEMAPS/public-api.md)、仕様の正本は[公開 API 仕様](./docs/service/features/05-public-api.md)、使い方は[開発者向けガイド](./docs/GUIDES/api/03-public-api-developer-guide.md)を参照。
  - 開発: `pnpm --filter @app/public-api dev`（`:48034`、Swagger UI `http://localhost:48034/docs`）／ テスト: `pnpm --filter @app/public-api test` ／ 検証用キー投入: `pnpm --filter @app/public-api seed`
- **管理者コンソール（`apps/admin`）＋共通フロントエンド（`apps/frontend-lib`）**: 運営チーム向け管理者コンソールを実装済み。認証（メール＋パスワード／WebAuthn パスキー）・RBAC・ユーザー管理・モデレーション（凍結/解除/アイコン削除）・通報審査・API キー運用＋共通レート制限・利用統計・監査ログ・管理者/権限管理、および §08 コンテンツ配信（お知らせ・メール通知・ヘルプ記事・問い合わせ対応・規約版管理）。`apps/api` に管理者向け GraphQL サーフェス（本番水準認証：Argon2id・サーバーセッション・WebAuthn）を追加。構造は[admin コードマップ](./docs/CODEMAPS/admin.md)・[frontend-lib コードマップ](./docs/CODEMAPS/frontend-lib.md)、仕様の正本は[管理者コンソール仕様](./docs/service/features/07-admin-console.md)・[コンテンツ&コミュニケーション](./docs/service/features/08-content-and-comms.md)を参照。
  - 開発: `pnpm --filter @app/admin dev`（`:48033`）／ 初期管理者投入: `pnpm --filter @app/api seed:admin`（既定 `admin@example.com` / `admin-password-12345`）／ カタログ: `pnpm --filter @app/frontend-lib storybook`
  - メール通知はローカルでは Mailpit（`http://localhost:48035`）へ送信され、Web UI で確認できる。
- ORM は **MikroORM 7**（EntitySchema）。テストは MikroORM 7/kysely が ESM 専用のため jest を ESM モードで実行する（[MikroORM ガイド](./docs/GUIDES/coding/06-mikroorm.md)）。
- 残りのアプリ（`apps/client`）は順次実装予定。変更履歴は [CHANGELOG.md](./CHANGELOG.md) を参照。

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
