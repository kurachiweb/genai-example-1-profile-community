# 公開 REST API 設計規約 — GenAI Profile Community

公開 API（`apps/public-api`、NestJS）の REST 設計・エンベロープ実装・エラー写像・認可ガード・レート制限・OpenAPI の**実装規約**を定義する。

> **位置づけ・境界宣言（重要）**: 公開 API の**業務仕様**——エンドポイント一覧・キースコープ（`read`/`full`）の定義・エラーコードの HTTP 対応・レート制限のしきい値・受け入れ条件——は [05-public-api.md](../../service/features/05-public-api.md)（SSoT）が正本である。本ガイドはそれらの**値を複製せず**、REST としての設計（URL 規約・冪等性・エンベロープ実装・例外写像・ガード構造・OpenAPI 生成）に限定する。
> 入力検証の値は [02-profile.md](../../service/features/02-profile.md) / [03-profile-sharing.md](../../service/features/03-profile-sharing.md)、共通規約は [00-common-rules.md](../../service/features/00-common-rules.md) が正本。
> **現状フェーズ**: `apps/public-api` は未実装で、本ガイドは実装に先行する設計規約である。

## 1. 位置づけと責務

- 公開 API は `client`/`admin` の内部 GraphQL とは独立した境界（別アプリ・別 Worker）で、外部開発者に REST で提供する（[infra/00-overview.md](../infra/00-overview.md) §2）。
- ベースパスは `/api/public/v1`（[05-public-api.md](../../service/features/05-public-api.md) §3）。認証は API キーのみで Cookie を用いない（[infra/01-network-architecture.md](../infra/01-network-architecture.md) §1）。
- 提供範囲は「本人プロフィールのフル CRUD」と「他者の実効公開分の Read」。公開 API で提供しない操作は `BR-API-010` を正本とする（退会・メール/パスワード変更・通報・管理者操作・パスキー操作 等）。

## 2. リソース設計と URL 規約

- リソース指向の URL とし、コレクションは複数形（`/profiles`）、本人の単一リソースは `/me/profile`、個別取得はハンドルをパスに置く（`/profiles/{handle}`）。
- **エンドポイントの一覧・必要スコープ・対象は再掲しない**。正本は [05-public-api.md](../../service/features/05-public-api.md) §3 の表。本ガイドは HTTP メソッドに与える設計上の約束のみを定める。

| メソッド | 設計上の意味（規約） |
| --- | --- |
| `GET` | 副作用なし・冪等。実効公開ゲート（§後述）を経た読み取り。 |
| `PUT` | 全体置換・冪等。同じ表現を再送しても結果が変わらない。 |
| `PATCH` | 部分更新・非冪等を許容。送られたフィールドのみ更新。 |
| `DELETE` | プロフィール**内容の消去＋非公開化**を意味する論理削除であり、アカウント自体は削除しない（業務上の意味は `BR-API-004`）。 |

## 3. 共通レスポンスエンベロープの実装

- すべての応答を共通エンベロープに包む。**エンベロープの構造の正本は `BR-COMMON-011`**（[00-common-rules.md](../../service/features/00-common-rules.md) COMMON-6）であり、本ガイドは実装の規約のみを定める。
- 成功・失敗いずれも同一の封筒形（`success`/`data`/`error`/`meta`）にし、ラップは NestJS の Interceptor で一律に行う（各コントローラで手組みしない）。

```jsonc
// 実装が出力する封筒の形（値は業務仕様 BR-COMMON-011 / BR-API-011 を参照。ここでは構造のみ）
{ "success": true,  "data": { /* リソース */ }, "error": null, "meta": { /* ページング等・任意 */ } }
{ "success": false, "data": null, "error": { "code": "<CODE>", "message": "<日本語>", "details": [ /* フィールド別・任意 */ ] } }
```

- `meta` はページングなど付加情報がある場合のみ埋め、無い場合の表現（`null` か省略か）を実装で統一する。
- `error.message` は日本語・一般化（`BR-COMMON-012`）。`error.details` はフィールド単位の違反内容（検証エラー時）。

## 4. エラーコード写像（実装規約）

- HTTP ステータスとエラーコードの**対応表の正本は `BR-API-011`**（[05-public-api.md](../../service/features/05-public-api.md) §5）。本ガイドは**写像の実装構造のみ**を定め、コード一覧を再掲しない。
- ドメイン例外 → エラーコード → HTTP ステータス → 共通エンベロープ の写像は NestJS の ExceptionFilter に集約する。コントローラ・サービスは意味のあるドメイン例外を投げ、HTTP 表現の決定は Filter に委ねる。
- エラーコードの**語彙**は内部 GraphQL の `extensions.code`（[01-graphql-internal.md](./01-graphql-internal.md) §4）と一致させ、面をまたいでも同義になるようにする。
- 想定外の内部エラーはコードを一般化（内部詳細を漏らさない）し、詳細は構造化ログにのみ残す（`BR-COMMON-012`/`014`）。

## 5. 認証・認可ガードの実装

- 認証は `Authorization: Bearer <api-key>`。受信キーを**ハッシュ照合**して引き当てる（保存はハッシュのみ、`BR-API-001`）。照合は `api_keys(key_hash)` の一意インデックス `uq_api_keys_key_hash` を用いる（[db/01-data-model.md](../db/01-data-model.md) §5.4・§6）。
- 認証ガード → スコープガード → 所有権/実効公開ガード の順で適用する。
  - **認証**: キー欠如・無効・失効は認証失敗として扱う（コード/HTTP は `BR-API-011`）。失効・無効化の条件は `BR-API-002`/`003`。
  - **スコープ**: `read`/`full` の許可操作は再掲せず `BR-API-001b` を正本とする。スコープ外の操作（例: `read` キーでの書き込み）は拒否する。
  - **所有権・実効公開**: 本人リソースのみ書き込み可。他者の読み取りは実効公開のみ返し、それ以外は秘匿する（`BR-COMMON-007`、判定式は再掲しない）。
- ユーザーが `FROZEN`/`WITHDRAWN` になった場合の全キー無効化は DB 反映の要点（[db/01-data-model.md](../db/01-data-model.md) §8、`BR-ACCT-009`）に従い、認証段階で失効キーを弾く。

## 6. API 固有セキュリティ（最小限）

公開 API に固有の点のみを定める。横断的なセキュリティヘッダ・CSP は `docs/GUIDES/security/`（今後整備）へ委譲する。

- **Cookie 不使用 → CSRF 面の縮小**: 公開 API は Cookie セッションを用いず API キーのみで認証するため、ブラウザの自動 Cookie 送信に起因する CSRF の面が縮小される（[infra/01-network-architecture.md](../infra/01-network-architecture.md) §1）。状態変更を伴う画面操作側の CSRF 対策は `BR-COMMON-004` を正本とする（公開 API とは別系統）。
- **CORS**: クライアント（ブラウザ）埋め込みの利用形態（`read` キー、`BR-API-010b`）を想定し、CORS は API キー前提で必要最小限のメソッド・ヘッダ（`Authorization` 等）に限って許可する方針とする。許可オリジンの具体方針は実装着手時に定め、横断方針は `security/` と整合させる。
- **キーの秘匿**: API キー秘匿値・`Authorization` ヘッダ値はログ・エラーに出力しない（`BR-COMMON-014`）。`full` キーはサーバーサイド限定の利用を前提とし、ドキュメント・発行画面で明示する（`BR-API-010b`）。
- **HTTPS 前提**: 本番のトランスポートセキュリティ・HSTS 等のヘッダは横断方針（`security/`・本番エッジ）に従う。

## 7. ページング実装

- 一覧はカーソル方式で実装し、`meta.nextCursor`（次ページ取得用の不透明カーソル）と `hasMore` を返す。`limit` の既定値・最大値は再掲せず `BR-API-007`（[04-profile-discovery.md](../../service/features/04-profile-discovery.md) と整合）を参照する。
- カーソルの中身（ULID 等）は不透明にエンコードし、利用者に構造を解釈させない。内部 GraphQL の Connection 表現との対応は [01-graphql-internal.md](./01-graphql-internal.md) §3。

## 8. レート制限の実装

- レート制限は `@nestjs/throttler` をアプリ層に、Cloudflare WAF を本番エッジに置く二層構成とする。しきい値・多層図・カウンタ配置の**正本は `BR-COMMON-010`・[infra/01-network-architecture.md](../infra/01-network-architecture.md) §3・[db/01-data-model.md](../db/01-data-model.md) §7**（本ガイドでは値を再掲しない）。
- キー単位カウンタは Durable Objects で厳密にカウントする。`@nestjs/throttler` の `ThrottlerStorage` を DO バックエンドで実装し、DO キー設計は `rl:apikey:<keyId>:<window>`（db §7・[ADR DO](../../adr/20260604-public-api-rate-limit-durable-objects.md)）に従う。
- 全応答に残量ヘッダ `RateLimit-Limit` / `RateLimit-Remaining` / `RateLimit-Reset` を付与し、超過時は `Retry-After` を添えてレート制限エラーを返す（挙動の正本は `BR-API-008`/`009`）。利用者側の対応は [03-public-api-developer-guide.md](./03-public-api-developer-guide.md) §6。

## 9. OpenAPI / Swagger UI 公開

- 全エンドポイント・スキーマ・エラー・レート制限を OpenAPI 定義として公開し、Swagger UI で探索可能にする（`BR-API-012`）。これが公開 API の**対話的リファレンス**であり、開発者がキー発行から疎通までを自己解決できる状態を目標とする。
- NestJS の Swagger デコレータでコントローラ・DTO から OpenAPI を生成する。エンベロープ・エラー・レート制限ヘッダもスキーマとして表現する。
- **二重管理の回避**: 各エンドポイントの説明（description）からは業務仕様の正本（`BR-API-*`）を参照させ、しきい値・上限・スコープ定義などの値を OpenAPI に**転記しない**。値が必要な箇所は SSoT を単一の出所とする。
- 本番での公開範囲（ドキュメント UI の到達性）と認証は横断方針に合わせて定める。

## 10. 入力検証

- リクエストボディは class-validator / class-transformer で検証する。検証ルールは画面と**同一**（`BR-API-006`）で、値の正本は [02-profile.md](../../service/features/02-profile.md) の各 `BR-PROF-*`（氏名必須・文字数・SNS リンク件数・`https` のみ 等）。
- 文字列は NFC 正規化・不可視文字除去・書記素単位の計数を行う（`BR-COMMON-008`/`009`）。ハンドルの設定・変更は形式・予約語・変更頻度・予約保持の制約（[03-profile-sharing.md](../../service/features/03-profile-sharing.md) `BR-SHARE-*`）に従う。
- アイコン画像は NSFW 判定の対象。拒否時は検証エラーとして扱う（`BR-SAFE-001`、HTTP/コードは `BR-API-011`）。
- 検証失敗はフィールド単位で `error.details` に示す（§3）。

## 11. 関連ドキュメント

- API 全体方針・横断原則: [00-overview.md](./00-overview.md)
- 公開 API 業務仕様の正本（エンドポイント・スコープ・エラー・レート制限・AC）: [05-public-api.md](../../service/features/05-public-api.md)
- 公開 API 開発者向け利用ガイド: [03-public-api-developer-guide.md](./03-public-api-developer-guide.md)
- 内部 GraphQL（エラー語彙・カーソル表現の対応先）: [01-graphql-internal.md](./01-graphql-internal.md)
- 経路・レート制限多層・セッション分離: [infra/01-network-architecture.md](../infra/01-network-architecture.md)
- `api_keys`・インデックス・KV/DO 配置: [db/01-data-model.md](../db/01-data-model.md) §5.4・§6・§7
