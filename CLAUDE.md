# プロフィール共有サービス「GenAI Profile Community」

「GenAI Profile Community」のプログラム一式、及びドキュメント。

## このサービスについて

アイコン画像・名前・職業を入力できる、プロフィール共有サービス。
各ユーザーは画面操作または公開APIを通じて自身のプロフィールをCRUD操作できる。
公開APIには1分あたりのリクエスト数制限(Rate Limit)が設けられている。
詳細な機能は[README.md](./README.md)を参照すること。

## 作業ルール

各種ドキュメント、Gitコミットメッセージ、コードコメントにおいて、全ての文章は日本語で記述すること。
機能追加や改修のように複数行のコードを変更する場合は、必ずAI-DLCフレームワークに従うこと。（必読ファイル：.aidlc-rule-details/core-workflow.md）
新規ビジネスロジックが無い軽微な変更であっても、影響範囲が広いものと考えて水平展開を行うこと。
コード内に「何をする処理か」のコメントは原則書かないが、難易度の高いロジックには理解を早めるためのコメントを添える。コードを読むだけでは分からない「なぜその処理が必要か」のコメントは書く。
車輪の再発明を許容し、簡易なユーティリティ関数のためにnpmパッケージをインストールしない。
サブエージェントを起動する際、Claude Haikuを使うよう指示があれば必ずSonnetを使うこと。
appsディレクトリ内の変更に基づき、docsディレクトリ内やREADME.mdも適時変更すること。
テスト駆動開発(TDD)の実施を徹底すること。
appsディレクトリ内を編集した際は、docsディレクトリ内の関連する内容も必ず更新すること。
GitワークフローはTrunk-Based Developmentを採用する。

## デプロイ方針

mainブランチにpushした際、dev環境に自動でデプロイする。
prod環境には、作業者が`git tag`コマンドでmainブランチにタグ付けするのをトリガーとしてデプロイが実行される。
AIエージェントによるprod環境へのデプロイは禁止する。

## ディレクトリ構成

モノレポ、3層Webアプリケーションである。

```
/
├── .github/                    # GitHub Actionsのワークフロー、CI/CD
├── .husky/                     # Huskyトリガー定義
├── apps/                       # アプリケーション実装
│   ├── infra/                  # インフラ構成定義 ... Terraformを使用、Cloudflareを主としてインフラを設計
│   ├── db/                     # DBサーバー ... SQLiteを使用、ローカル開発でのポート番号は55030、DBスキーマ定義を含む
│   ├── api/                    # APIサーバー ... NestJSを利用、ローカル開発でのポート番号は55031
│   ├── client/                 # Webサーバー兼フロントエンド(利用者側) ... Next.jsを利用、ローカル開発でのポート番号は55032
│   ├── admin/                  # Webサーバー兼フロントエンド(管理者側) ... Next.jsを利用、ローカル開発でのポート番号は55033
│   └── public-api/             # 公開APIサーバー ... NestJSを利用、ローカル開発でのポート番号は55034
├── docs/                       # ドキュメント ... 全てマークダウン形式
│   ├── onboardings/            # オンボーディングガイド ... 環境構築手順やドキュメント索引
│   ├── adr/                    # Everything Claude Codeのecc-architecture-decision-recordsスキルによる自動生成ADR
│   ├── CODEMAPS/               # Everything Claude Codeのecc-doc-updaterエージェントによる自動生成コードマップ
│   ├── GUIDES/                 # 開発者ドキュメント、Everything Claude Codeのecc-doc-updaterエージェントにより都度更新
│   │   ├── infra/              # インフラ・ネットワーク構成図、デプロイ手順、ログ管理方針
│   │   ├── db/                 # データベース設計原則、マイグレーション手順
│   │   ├── api/                # APIドキュメント及び設計原則
│   │   ├── coding/             # コーディングルール、アーキテクチャ設計
│   │   ├── testing/            # テスト方針、カバレッジ設定
│   │   ├── design-system/      # デザインシステム、Storybookによるコンポーネント定義
│   │   ├── operations/         # 運用ガイド ... デプロイや障害対応、ロールバックや問い合わせ駆動調査手順
│   │   └── security/           # 包括的なセキュリティガイド、認証認可設計、システム監視及び対応方針
│   └── service/                # このサービスに関する資料
│       ├── overview/           # サービス概要、コンセプト、どのユーザーがこのサービスを必要とするか、ユーザーストーリー
│       ├── features/           # ビジネスルール(SSoT) ... 機能仕様、受け入れ条件一覧
│       ├── screens/            # 画面ごとの仕様、デザインシステムに基づく利用者側・管理者側各画面のワイヤーフレーム
│       └── glossary.md         # サービス内用語集
├── Dockerfile                  # npmパッケージ等をグローバルインストールするためのコンテナ
├── docker-compose.yaml         # ルートと各アプリケーションのコンテナを定義しポート番号を指定
├── package.json                # プロジェクトルート ... commitlint、husky、lint-stagedによるgit管理の厳格化
├── pnpm-workspace.yaml         # pnpmのallowBuilds設定
├── CHANGELOG.md                # リリースログ
└── README.md                   # 作業者向け、サービスの基本的説明
```

## 技術選定

それぞれ最新バージョンを用いる。

### フロントエンド

#### フレームワーク・ライブラリ

Next.js (App Router使用)
React
TypeScript

#### 状態管理・データフェッチング

Apollo Client (GraphQL クライアント)
Jotai (グローバル状態管理)
React Query (キャッシュ・再取得制御の補完)

#### UI・スタイリング

Tailwind CSS
shadcn/ui

#### フォーム・バリデーション

React Hook Form
Zod

### バックエンド (API)

#### フレームワーク

NestJS (クリーンアーキテクチャ)
Hono (Cloudflare Workers向け設定)
Apollo Server (NestJSと統合)
TypeScript

GraphQL
GraphQL Code Generator (型自動生成)
DataLoader (GraphQLのN+1問題対策)

#### データベース・ORM

SQLiteに接続するよう設定。デプロイ先ではCloudflare D1を使用。
MikroORM

#### 認証・認可

HTTPS-Only Cookieによるユーザー認証。
ロールベースのアクセス制御
所有権ベースのアクセス制御（自ユーザー・全ユーザー・管理者）

#### バリデーション・変換

class-validator
class-transformer

### デプロイする場合のインフラ構成

Cloudflare Workers

#### ストレージ

Cloudflare R2 (画像・ファイルストレージ)

#### セキュリティ

Cloudflareにおける、個人開発アプリケーション向けの低コストで基本的な設定。

@nestjs/throttler (ユーザーごとに1分あたりのリクエスト数を制限)
Cloudflare WAF Rate Limiting Rules (APIレートリミットの本番実装 ... 制限閾値はTerraformで管理)

#### 構造化ロギング

LogTape

#### メール送信

MJML (faire/mjml-reactを使用)
Amazon SES (@aws-sdk/client-sesを使用、ローカル環境ではMailpit)

#### モニタリング

Sentry (エラートラッキング)

### 画像配信

Cloudflare Images

#### 画像モデレーション

Amazon Rekognition (ローカル環境やCIプロセスでは、テスト結果を毎回同じにするため決定論的スタブの偽判定器を使用)

#### CI/CD

GitHubリポジトリでのmainブランチへのpushをトリガーにして、GitHub Actionsにより以下のパイプラインを実行。
TruffleHog (機密情報のpush防止)
Workers Builds

### 開発環境・ツール

#### コンテナ

Docker (node@trixie)

#### IaaC

Terraform

#### パッケージマネージャー

pnpm

#### コード品質

ESLint + Prettier
Husky + lint-staged (pre-commit)
Commitlint (コミットメッセージ規約)

#### セキュリティ

Gitleaks (pre-commit、コマンドオプション `--staged` を使用)

#### テスト

Jest (単体テスト)
React Testing Library (フロントエンド)
Supertest (API統合テスト)
Playwright (E2E)

#### ドキュメント

Storybook (コンポーネントカタログ)
GraphQL Playground (API探索)
Swagger UI (公開API向け、OpenAPI形式)
