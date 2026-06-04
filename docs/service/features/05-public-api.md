# 機能仕様 — ApiKey / 公開 API

エンティティ **ApiKey** と、公開 API（API キー認証によるプロフィール CRUD・他者公開分の Read・レート制限）のビジネスルールと受け入れ条件を定義する。

> 横断前提は [00-common-rules.md](./00-common-rules.md)。対応エピック: EP-05。
> 範囲方針（本人フル CRUD ＋ 他者公開分 Read）は本書を正本とする。プロフィールの制約値は [02-profile.md](./02-profile.md) を参照。

## 1. 概要

公開 API は画面と対等な「一級の入り口」（コンセプト）であり、API キーを持つ開発者が自身のプロフィールをプログラムから一元管理し、他ユーザーの公開プロフィールを取得できる。
本番ではエッジ（Cloudflare WAF）とアプリ層（@nestjs/throttler）の二層でレート制限する。OpenAPI 定義を公開し、Swagger UI で探索できる。

## 2. 認証・キー（ApiKey）

### BR-API-001 API キーの認証方式

- 公開 API は **API キー**で認証する。HTTP ヘッダ `Authorization: Bearer <api-key>` で送信する。
- API キーはユーザーに紐づき、**そのユーザーの権限で動作**する（所有権ベース、[00-common-rules.md](./00-common-rules.md)）。
- キー値は**発行時に一度だけ全体表示**し、サーバーには**ハッシュ化して保存**する。再表示はできない（紛失時は失効＋再発行）。
  - 根拠: 秘匿値の保存リスク低減（`BR-COMMON-014`）。

### BR-API-002 キーの発行条件・上限

| 項目 | 値 | 根拠 |
| --- | --- | --- |
| 発行可能な状態 | `S-USER-ACTIVE`（メール確認済み）のみ | 未確認・凍結・退会は不可（`BR-COMMON-005`）。 |
| 有効キー上限 | ユーザーあたり 5 個 | 本番/検証など用途分けに十分。乱発を防ぐ。 |
| 任意ラベル | 最大 50 文字 | 用途識別（例: 「ポートフォリオサイト用」）。 |
| 失効 | 任意のキーをいつでも失効可能 | 漏えい時に即時遮断。 |

### BR-API-003 キーのライフサイクルと監査

- キーの発行・失効は監査ログに記録する（`BR-COMMON-013`）。
- ユーザーが `FROZEN`/`WITHDRAWN` になった場合、当該ユーザーのキーはすべて無効化される（[01](./01-user-account.md)/[06](./06-trust-and-safety.md)）。
- キーには最終利用日時を記録し、管理画面・本人設定で確認できる。

## 3. エンドポイント仕様

ベースパスは `/api/public/v1`（以下、相対表記）。すべての応答は共通エンベロープ（`BR-COMMON-011`）に従う。

| メソッド・パス | 説明 | 認証 | 対象 |
| --- | --- | --- | --- |
| `GET /me/profile` | 自分のプロフィール取得（Read） | 必須 | 本人 |
| `PUT /me/profile` | 自分のプロフィール全体作成/置換（Create/Update） | 必須 | 本人 |
| `PATCH /me/profile` | 自分のプロフィール部分更新（Update） | 必須 | 本人 |
| `DELETE /me/profile` | 自分のプロフィール内容の消去＋非公開化（Delete） | 必須 | 本人 |
| `GET /profiles/{handle}` | 他ユーザーを含む**公開**プロフィール取得（Read） | 必須 | 実効公開のみ |
| `GET /profiles` | 公開プロフィール一覧（カーソルページング） | 必須 | 実効公開のみ |

### BR-API-004 本人プロフィールのフル CRUD（範囲方針）

- API キーの所有者は、自身のプロフィールに対し **Create / Read / Update / Delete** を行える。
- Profile は 1:1 でアカウント作成時に空生成される（[02-profile.md](./02-profile.md)）。そのため公開 API の意味は次のとおり:
  - **Create/Update**: `PUT /me/profile`（全体置換）または `PATCH /me/profile`（部分更新）で内容を設定・更新する。
  - **Delete**: `DELETE /me/profile` は**プロフィール内容を消去し visibility を `private` にする**。アカウント自体は削除しない。
- 退会（アカウント削除）は公開 API では提供しない（`BR-API-010`）。

### BR-API-005 他者公開プロフィールの Read

- `GET /profiles/{handle}` と `GET /profiles` は、**実効公開（`BR-COMMON-007`）のプロフィールのみ**を返す。
- 非公開・未確認・凍結・退会・存在しないハンドルは、本人の認証であっても他者分は `404`（秘匿、`BR-SHARE-006` と整合）。
- 返却フィールドは公開ページの表示内容に準じ、メールアドレス等の非公開属性は含めない。

### BR-API-006 入力検証・整合

- リクエストボディは画面と同一のビジネスルール（[02-profile.md](./02-profile.md) の各 BR：氏名必須・文字数・SNS リンク件数・`https` のみ 等）で検証する。
- ハンドルの設定・変更を API から行う場合も、[03-profile-sharing.md](./03-profile-sharing.md) の形式・予約語・変更頻度・予約保持の制約に従う。
- アイコン画像のアップロードは NSFW 判定（`BR-SAFE-001`）の対象。判定で拒否された場合は `422` を返す。

### BR-API-007 ページング（カーソル方式）

- `GET /profiles` はカーソルベースのページングとし、`meta` に `nextCursor` を返す。`limit` は既定 20・最大 100（[04-profile-discovery.md](./04-profile-discovery.md) と整合）。

```jsonc
{ "success": true, "data": [ /* profiles */ ], "error": null,
  "meta": { "limit": 20, "nextCursor": "eyJpZCI6…", "hasMore": true } }
```

## 4. レート制限（ApiKey 単位）

### BR-API-008 しきい値とヘッダ

| 項目 | 値 | 根拠 |
| --- | --- | --- |
| 既定しきい値 | 60 リクエスト / 分 / API キー | 自作サイト埋め込み等の通常利用に十分。濫用を抑制（`BR-COMMON-010`）。 |
| 変更 | 管理者が全キー共通値を変更可能 | [07-admin-console.md](./07-admin-console.md) `BR-ADMIN-008`。本番エッジ閾値は Terraform 管理。 |
| 応答ヘッダ | `RateLimit-Limit` / `RateLimit-Remaining` / `RateLimit-Reset` | 利用者が残量を把握できる（US-0504）。 |
| 超過時 | `429 Too Many Requests` ＋ `Retry-After` | 標準的な挙動。 |

### BR-API-009 超過時の挙動

- しきい値超過のリクエストは処理せず `429` を返し、`Retry-After`（秒）と共通エラーエンベロープで理由を示す。
- レート制限はキー単位で独立してカウントする。

## 5. セキュリティ・操作制限

### BR-API-010 公開 API で不可とする操作

次の操作は公開 API では提供しない（画面操作・再認証が必要）:

- アカウント退会（削除）、メールアドレス変更、パスワード変更（[01-user-account.md](./01-user-account.md)）。
- 凍結解除リクエストの送信、通報の送信（問い合わせフォーム経由、[06-trust-and-safety.md](./06-trust-and-safety.md)）。
- 管理者操作全般（[07-admin-console.md](./07-admin-console.md)）。
  - 根拠: 不可逆・高権限の操作をキー漏えい時の攻撃面から外す。

### BR-API-011 エラーコード規約

| HTTP | code | 意味 |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | 形式不正・パラメータ誤り |
| 401 | `UNAUTHORIZED` | API キー欠如・無効・失効 |
| 403 | `FORBIDDEN` | 他者リソースへの書き込み等、権限外操作 |
| 404 | `NOT_FOUND` | 存在しない／非公開（秘匿） |
| 422 | `VALIDATION_ERROR` | ビジネスルール違反（文字数・NSFW 等） |
| 429 | `RATE_LIMITED` | レート制限超過 |
| 500 | `INTERNAL_ERROR` | サーバー内部エラー（詳細はログのみ） |

### BR-API-012 ドキュメント公開

- OpenAPI（Swagger UI）で全エンドポイント・スキーマ・エラー・レート制限を公開する（US-0504）。
- 認証・レート制限・エラー規約を明記し、開発者がキー発行から疎通までを自己解決できるようにする。

## 6. 受け入れ条件（Given/When/Then）

### API キー

#### AC-API-001 キー発行と一度限りの表示（正常系）

- **関連ストーリー**: US-0501
- **Given**: `ACTIVE` のユーザーが API キー管理画面にいる
- **When**: 新しいキーをラベル付きで発行する
- **Then**: キー値が一度だけ全体表示され、以後は再表示されず、サーバーにはハッシュで保存され、発行が監査ログに記録される

#### AC-API-002 未確認ユーザーは発行不可（異常系・整合）

- **関連ストーリー**: US-0501 / US-0101
- **Given**: `UNVERIFIED` のユーザー
- **When**: API キー発行を試みる
- **Then**: メール確認が必要である旨が示され、発行されない

#### AC-API-003 キー上限（境界値）

- **関連ストーリー**: US-0501
- **Given**: 有効キーを 5 個持つユーザー
- **When**: 6 個目を発行しようとする
- **Then**: 上限到達の案内が表示され、発行されない（不要キーの失効を促す）

#### AC-API-004 キー失効で即時無効（正常系）

- **関連ストーリー**: US-0501
- **Given**: 有効な API キーが存在する
- **When**: そのキーを失効する
- **Then**: 以後そのキーでの API 呼び出しは `401 UNAUTHORIZED` となり、失効が監査ログに記録される

### Read

#### AC-API-005 自分のプロフィール取得（正常系）

- **関連ストーリー**: US-0502
- **Given**: 有効なキーを持つユーザー
- **When**: `GET /me/profile` を呼ぶ
- **Then**: 自分のプロフィールが共通エンベロープで返る（非公開状態でも本人なので取得可）

#### AC-API-006 他者の公開プロフィール取得（正常系）

- **関連ストーリー**: US-0502
- **Given**: 実効公開の他ユーザー `taro` が存在する
- **When**: `GET /profiles/taro` を呼ぶ
- **Then**: 公開可能なフィールドのみが返り、メール等の非公開属性は含まれない

#### AC-API-007 非公開ユーザーの秘匿（異常系・整合）

- **関連ストーリー**: US-0502 / US-0302
- **Given**: 非公開・未確認・凍結のいずれかのユーザー `hidden`
- **When**: `GET /profiles/hidden` を呼ぶ
- **Then**: `404 NOT_FOUND` が返り、存在・状態が漏れない

### Create / Update / Delete

#### AC-API-008 プロフィールの更新（正常系）

- **関連ストーリー**: US-0503
- **Given**: 有効なキーを持つユーザー
- **When**: `PATCH /me/profile` で職業と SNS リンクを更新する
- **Then**: ビジネスルール検証を通過した内容が保存され、画面・公開ページにも反映される

#### AC-API-009 バリデーション違反（異常系）

- **関連ストーリー**: US-0503
- **Given**: 有効なキーを持つユーザー
- **When**: `PUT /me/profile` で 501 文字の自己紹介や 11 件目の SNS リンクを送る
- **Then**: `422 VALIDATION_ERROR` が返り、違反フィールドが `error.details` に示される

#### AC-API-010 DELETE はプロフィール消去・非公開化（正常系・整合）

- **関連ストーリー**: US-0503
- **Given**: 公開中のプロフィールを持つユーザー
- **When**: `DELETE /me/profile` を呼ぶ
- **Then**: プロフィール内容が消去され visibility が `private` になるが、**アカウントは存続**し、ログインは引き続き可能

#### AC-API-011 他者リソースの書き込み拒否（異常系・セキュリティ）

- **関連ストーリー**: US-0503
- **Given**: 有効なキーを持つユーザー
- **When**: 他ユーザーのプロフィールを更新しようと試みる
- **Then**: `403 FORBIDDEN` が返り、変更されない

#### AC-API-012 退会は API 不可（異常系・セキュリティ）

- **関連ストーリー**: US-0503 / US-0105
- **Given**: 有効なキーを持つユーザー
- **When**: 公開 API でアカウント退会を試みる
- **Then**: 該当エンドポイントが存在せず拒否される（画面・再認証が必要）

### レート制限

#### AC-API-013 残量ヘッダの提示（正常系）

- **関連ストーリー**: US-0504
- **Given**: 有効なキーを持つ
- **When**: API を呼び出す
- **Then**: 応答に `RateLimit-Limit` / `RateLimit-Remaining` / `RateLimit-Reset` が含まれる

#### AC-API-014 しきい値超過で 429（境界値）

- **関連ストーリー**: US-0504
- **Given**: 直近 1 分で 60 リクエストを使い切った API キー
- **When**: 同じキーで 61 回目を呼ぶ
- **Then**: `429 RATE_LIMITED` と `Retry-After` が返り、リセット後は再び成功する

## 7. 関連ドキュメント

- 横断ルール（レート制限・エンベロープ）: [00-common-rules.md](./00-common-rules.md)
- プロフィールのビジネスルール: [02-profile.md](./02-profile.md) / [03-profile-sharing.md](./03-profile-sharing.md)
- 一覧・ページング: [04-profile-discovery.md](./04-profile-discovery.md)
- 管理者によるキー監視・しきい値変更: [07-admin-console.md](./07-admin-console.md)
- レート制限カウンタの保存先（キー単位は Durable Objects で厳密化）: [ADR 20260604-public-api-rate-limit-durable-objects](../../adr/20260604-public-api-rate-limit-durable-objects.md)
- API 設計原則: `docs/GUIDES/api/`（今後整備）

## 8. オープン事項（将来課題）

- **書き込みのスコープ付きキー**: Read 専用キー等のスコープ細分化は将来課題（v1 はキー=本人権限）。
