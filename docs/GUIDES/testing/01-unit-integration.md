# 単体・統合テスト規約 — GenAI Profile Community

単体テスト（純粋ロジック・コンポーネント）と統合テスト（API・DB）の規約・モック戦略を定義する。
全体戦略は [00-overview.md](./00-overview.md)、E2E は [02-e2e.md](./02-e2e.md) を参照。

> **位置づけ**: 本ガイドは [ecc-common/testing.md](../../../.claude/rules/ecc-common/testing.md)・[ecc-web/testing.md](../../../.claude/rules/ecc-web/testing.md) を本サービスへ具体化したものである。
> テスト対象の業務値・受け入れ条件の正本は [docs/service/features/](../../service/features/)。
> **現状フェーズ**: `apps/api`（内部 GraphQL）・`apps/public-api`（公開 REST）が本規約に沿って単体・統合テストを整備済み（Jest・Supertest、各 [CODEMAPS](../../CODEMAPS/)）。MikroORM 7/kysely が ESM 専用のため jest は ESM モード（`node --experimental-vm-modules`・ts-jest `useESM`）で実行し、型検査は `tsc --noEmit` に委ねる（[coding/06-mikroorm.md](../coding/06-mikroorm.md) §9）。他アプリ（`client`/`admin`）は実装に先行する規約である。

## 1. 単体テスト（Jest）

### 1.1 対象

純粋関数・ドメインロジック・ユーティリティ・カスタムフックを **Jest** で検証する。本サービスで特に厚く書く対象（[00-overview.md](./00-overview.md) §3）:

| 対象 | 代表ケース | 正本 |
| --- | --- | --- |
| 実効公開ゲート | `public` × 所有者状態（ACTIVE/UNVERIFIED/FROZEN/WITHDRAWN）の真偽 | `BR-COMMON-007` |
| 入力検証・正規化 | NFC 正規化・不可視文字除去・書記素単位の文字数・トリム | `BR-COMMON-008`/`009` |
| 状態遷移 | User 状態の許可遷移・禁止遷移 | `COMMON-2`（[00-common-rules.md](../../service/features/00-common-rules.md)） |
| エラー写像 | ドメイン例外 → `extensions.code` / HTTP ステータスの対称写像 | `BR-API-011`（[api/00-overview.md](../api/00-overview.md) §2.4） |
| カーソル | ULID 等のエンコード/デコードの可逆性・不透明性 | `BR-DISC-003`/`BR-API-007` |
| レート制限判定 | しきい値超過の判定・`Retry-After` 算出 | `BR-COMMON-010` |

- ドメインロジックは**フレームワーク非依存**に書かれている前提（クリーンアーキテクチャの Entities、[coding/01-architecture.md](../coding/01-architecture.md) §2）。NestJS/Cloudflare に依存しないため、素の Jest で高速に検証できる。

### 1.2 フロントエンド（React Testing Library）

- **React Testing Library** で**ユーザーの振る舞い**を検証する。ロール・ラベル・テキスト経由で要素を取得し、実装詳細（クラス名・内部状態）に依存しない（[ecc-web/testing.md](../../../.claude/rules/ecc-web/testing.md)）。
- フォーム（React Hook Form + Zod）は、検証エラー表示・送信可否・エラーメッセージ（日本語・`BR-COMMON-012`）を検証する。スキーマは features/ の業務値に整合させる。
- ネットワークはローカルモック（例: MSW 等）で固定し、ネットワーク非依存にする（[00-overview.md](./00-overview.md) §5）。
- **アクセシビリティ**: 重要コンポーネントは **jest-axe** で自動チェックし、明白な違反を検出する（補助、[00-overview.md](./00-overview.md) §2）。
- 視覚表現が主のコンポーネントは、脆い DOM アサーションより E2E のビジュアル回帰（[02](./02-e2e.md)）が有効な場合がある。ビジュアル回帰はカバレッジを置き換えない。

## 2. 統合テスト

### 2.1 公開 REST API（Supertest）

- `public-api` のエンドポイントは **Supertest** で HTTP レベルに検証する（[CLAUDE.md](../../../CLAUDE.md)）。
- 検証観点（正本は [05-public-api.md](../../service/features/05-public-api.md) / [api/02-public-rest-api.md](../api/02-public-rest-api.md)）:
  - **共通エンベロープ**（成功 `success/data/meta`、失敗 `success/error{code,message,details}`、`BR-COMMON-011`）。
  - **認証/認可**: API キー（`Authorization: Bearer`）・スコープ（`read`/`full`）・所有権ベースの拒否。
  - **実効公開ゲート**: 非公開/未確認/凍結/退会/不存在は一律 `404` 相当で秘匿（`BR-COMMON-007`）。
  - **エラー写像**: HTTP ステータスとコードの対応（`BR-API-011`）。
  - **レート制限**: 超過時 `429` + `Retry-After`（`BR-COMMON-010`）。
  - **ページング**: `meta.nextCursor`/`hasMore`（`BR-API-007`）。

### 2.2 内部 GraphQL API（`api`）

- リゾルバ/モジュール単位で、認可・実効公開ゲート・エラー表現（`extensions.code`）・カーソル接続（`edges`/`pageInfo`）を検証する（[api/01-graphql-internal.md](../api/01-graphql-internal.md)）。
- **DataLoader** のバッチ化が効いていること（N+1 が発生しないこと）を、リポジトリ呼び出し回数で検証する（[api/01-graphql-internal.md](../api/01-graphql-internal.md) §5）。
- loader はリクエストスコープで生成され、リクエストをまたいでキャッシュを共有しないことを確認する。

### 2.3 DB 操作（MikroORM）

- DB 統合テストは**テスト用 SQLite**（インメモリまたは一時ファイル）に対して実行する。D1 は SQLite 互換のため、ローカル/CI は SQLite で代替する（[db/00-overview.md](../db/00-overview.md) §1）。
- **外部キー制約を有効化**（`PRAGMA foreign_keys = ON`）した状態で参照整合性・カスケードを検証する（[db/00-overview.md](../db/00-overview.md) §2.1）。
- `audit_logs` の**追記専用・改ざん不可**（UPDATE/DELETE 拒否トリガー）を検証する（`BR-ADMIN-010`）。
- ユニーク制約（`email_normalized`・`handle`）・インデックスの存在を検証する（[db/00-overview.md](../db/00-overview.md) §5）。
- マイグレーションの適用/ロールバックが通ることを確認する（[db/02-migrations.md](../db/02-migrations.md)）。

## 3. モック/フェイク戦略

Use Case 層が宣言する **Gateway（インターフェース）境界**で差し替える（[coding/01-architecture.md](../coding/01-architecture.md) §2.2）。Entities / Use Case のテストは実 I/O に依存しない。

| 依存 | テストでの扱い |
| --- | --- |
| Rekognition（NSFW 判定） | **決定論的スタブの偽判定器**（合格/不合格を入力で制御、`BR-SAFE-001`・[ADR](../../adr/20260603-nsfw-moderation-rekognition.md)） |
| SES（メール送信） | モック/フェイクで送信内容（宛先・テンプレート・トークン）を検証。ローカルは Mailpit |
| R2 / Cloudflare Images | フェイクストレージ。アイコンは**参照 ID のみ** DB に持つ前提を検証（[db/00-overview.md](../db/00-overview.md) §1） |
| KV / Durable Objects | インメモリのフェイク（セッション・トークン・レート制限カウンタ）。TTL 期限切れも模す |
| 時刻 / ULID | 固定クロック・固定シードで決定化（[00-overview.md](./00-overview.md) §5） |
| フロントのネットワーク | ローカルモック（例: MSW 等）で GraphQL/REST 応答を固定 |

- モックは**境界に限定**し、内部実装をモックしすぎない（テストが実装に密結合し脆くなるのを避ける）。

## 4. テスト構造・分離・命名

- **AAA パターン**（Arrange-Act-Assert）で記述する（[ecc-common/testing.md](../../../.claude/rules/ecc-common/testing.md)）。
- 各テストは独立に実行・並列化できること。DB/KV フェイク等の共有状態は**テストごとに初期化またはトランザクションでロールバック**する。グローバル状態をテスト間で持ち越さない。
- テスト名は振る舞いを説明する（例: `メール未確認のユーザーの公開ページは第三者に404を返す`）。
- 失敗時の切り分けは「テスト分離 → モックの正しさ → 実装の修正（テストが誤っている場合のみテスト修正）」の順で行う（[ecc-common/testing.md](../../../.claude/rules/ecc-common/testing.md)）。

## 5. 関連ドキュメント

- テスト戦略・配分・決定性: [00-overview.md](./00-overview.md)
- E2E テスト: [02-e2e.md](./02-e2e.md)
- API 設計規約（検証対象の境界・エラー写像・DataLoader）: [docs/GUIDES/api/](../api/)
- データベース設計・マイグレーション: [docs/GUIDES/db/](../db/)
- アーキテクチャ（Gateway 境界でのモック差し替え）: [coding/01-architecture.md](../coding/01-architecture.md)
- 受け入れ条件の正本: [docs/service/features/](../../service/features/)
