# 変更履歴（CHANGELOG）

本ファイルはリリースログである。記法は [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に準拠し、日付は UTC とする。

## [Unreleased]

### Added

- **内部 GraphQL API（`apps/api`）のプロフィール共有コアドメインを実装**（ユニット `api-internal-profile`）。
  NestJS 11 + Apollo Server（code-first）+ MikroORM 6（SQLite / D1 互換）によるクリーンアーキテクチャ構成。
  - ドメイン層: 実効公開ゲート（`BR-COMMON-007`）・状態遷移（`COMMON-2`）・入力正規化と書記素計数（`BR-COMMON-008/009`）・ハンドル検証（`BR-SHARE-001/002`）・表示名導出（`BR-PROF-003/004`）・カーソル・エラー語彙（`BR-API-011`）。
  - ユースケース層: プロフィール取得（本人／ハンドル）・一覧（カーソル接続・検索）・更新・公開切替・ハンドル変更・SNS リンク一括設定。Gateway をインターフェースで宣言。
  - 永続化層: MikroORM エンティティ（`users`/`profiles`/`sns_links`）・リポジトリ（Gateway 実装）・実効公開フィルタ・キーセットページング。
  - GraphQL 層: リゾルバ・Connection 型・DataLoader（N+1 回避）・例外フィルタ（`extensions.code`）・ValidationPipe。
  - 起動: 環境変数検証・`main.ts`・ローカル開発用シード。
  - テスト: Jest 単体・統合 107 件（TDD）。ドメイン/ユースケースのカバレッジ 98%。
- AI-DLC の inception/construction 成果物を `aidlc-docs/` に追加。

### Notes

- 本ユニットの範囲外（後続ユニット）: アカウント認証フロー・公開 REST API（`apps/public-api`）・API キー・Trust&Safety・管理者コンソール・コンテンツ配信・NSFW 判定・画像/メール・本番 Hono/Workers アダプタ・レート制限の実カウンタ。
- ローカル開発ランタイムは `@nestjs/platform-express`。本番（Cloudflare Workers / Hono）は後続ユニットで対応する。
