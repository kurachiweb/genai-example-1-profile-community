# 公開 API 開発者向け利用ガイド — GenAI Profile Community

公開 REST API を使う開発者・自サイト埋め込み実装者向けに、API キーの発行から疎通・エラー対処・代表的なユースケースまでを示す。

> **位置づけ**: 本ガイドは「使い方」を示す導入資料である。エンドポイント・スコープ・しきい値・エラーコードなどの**仕様の正本は [05-public-api.md](../../service/features/05-public-api.md)**、機械可読かつ網羅的な**対話的リファレンスは Swagger UI（OpenAPI）**。本ガイドは値を持たず参照する。
> 設計・実装の規約は [02-public-rest-api.md](./02-public-rest-api.md) を参照。
> **現状フェーズ**: `apps/public-api` は未実装で、本ガイドは実装に先行する利用想定である。以下のホスト名（`api.example.com`）は例示。

## 1. はじめに

- **できること**: 自分のプロフィールの取得・作成/更新・削除（内容消去＋非公開化）、他ユーザーの**実効公開**プロフィールの取得・一覧。
- **できないこと**: アカウント退会、メール/パスワード変更、通報送信、凍結解除リクエスト、管理者操作、パスキー操作。これらは画面操作・再認証が必要（正本は `BR-API-010`）。
- ベースパスは `/api/public/v1`。全エンドポイントの一覧・必要スコープは [05-public-api.md](../../service/features/05-public-api.md) §3 と Swagger UI を参照。

## 2. クイックスタート（疎通まで）

1. **アカウントを `ACTIVE` にする**: メール確認が完了している必要がある（未確認ではキーを発行できない、`BR-API-002`）。
2. **API キーを発行する**: 設定画面でラベルとスコープ（`read` / `full`）を選んで発行する。**キー値は発行時に一度だけ全体表示**され、以後は再表示できない（サーバーにはハッシュで保存）。安全な場所に保管し、紛失時は失効＋再発行する（`BR-API-001`）。
3. **スコープを選ぶ**: ブラウザ等クライアントに埋め込むキーは **`read`**、サーバーサイドで書き込むキーは **`full`**（使い分けは `BR-API-010b`、§3 も参照）。
4. **最初のリクエストを送る**: 自分のプロフィールを取得して疎通を確認する。

```bash
export API_KEY="発行したキー"
curl -s https://api.example.com/api/public/v1/me/profile \
  -H "Authorization: Bearer ${API_KEY}"
```

成功すると共通エンベロープ（§4）で自分のプロフィールが返る。

## 3. 認証

- すべてのリクエストに `Authorization: Bearer <api-key>` ヘッダを付ける。
- キーは**ユーザーに紐づき、付与スコープの範囲でそのユーザーの権限**で動作する。
- **紛失・漏えい時は即座に失効**させ、新しいキーを発行する（スコープは発行後に変更できないため、昇格も失効＋再発行）。
- 1 ユーザーが持てる有効キー数には上限がある（値は `BR-API-002`）。用途ごとにラベルを付けて管理する。
- **ブラウザに埋め込むキーは必ず `read`**。`full` キーはサーバーサイドのみで扱い、フロントエンドのコード・公開リポジトリに置かない。

## 4. リクエスト / レスポンスの読み方

すべての応答は共通エンベロープに包まれる（構造の正本は `BR-COMMON-011`）。

- 成功: `success: true`、`data` に結果、`meta` にページング等（任意）。
- 失敗: `success: false`、`error.code`（機械判定用）・`error.message`（日本語）・`error.details`（フィールド別、検証エラー時）。

```js
const res = await fetch("https://api.example.com/api/public/v1/me/profile", {
  headers: { Authorization: `Bearer ${process.env.API_KEY}` },
});
const body = await res.json();
if (!body.success) {
  // body.error.code で分岐（§7）
  throw new Error(`${body.error.code}: ${body.error.message}`);
}
const profile = body.data;
```

- まず `success`（または HTTP ステータス）で成否を判定し、失敗時は `error.code` で処理を分岐する。`error.message` はユーザー表示向けで、分岐条件に使わない。

## 5. ページングの消費

- 一覧（`GET /profiles`）はカーソル方式。応答の `meta.nextCursor` と `meta.hasMore` を使って次ページを辿る。`limit` の既定値・最大値は `BR-API-007` を参照（本ガイドでは固定値を書かない）。

```js
async function fetchAllProfiles() {
  const items = [];
  let cursor = null;
  do {
    const url = new URL("https://api.example.com/api/public/v1/profiles");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.API_KEY}` },
    });
    const body = await res.json();
    if (!body.success) break; // §7 に従って対処
    items.push(...body.data);
    cursor = body.meta.hasMore ? body.meta.nextCursor : null;
  } while (cursor);
  return items;
}
```

- `nextCursor` は不透明な文字列であり、中身を解釈・生成しない。返ってきた値をそのまま次のリクエストに渡す。

## 6. レート制限への対応

- すべての応答に残量ヘッダ `RateLimit-Limit` / `RateLimit-Remaining` / `RateLimit-Reset` が付く。`RateLimit-Remaining` を見て送信ペースを調整する。
- しきい値（キー単位の上限）の値は `BR-API-008` を参照。レート制限はキー単位で独立してカウントされる。
- 超過すると**レート制限エラー**（`error.code` は `RATE_LIMITED`）が返り、`Retry-After`（秒）が添えられる。`Retry-After` に従って待機し、指数バックオフで再試行する。

```js
async function requestWithBackoff(url, init, maxRetries = 5) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, init);
    if (res.status !== 429) return res;
    const retryAfter = Number(res.headers.get("Retry-After")) || 2 ** attempt;
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
  }
  throw new Error("レート制限が解除されませんでした");
}
```

## 7. エラー対処ガイド

`error.code`（と HTTP ステータス）で分岐する。**各コードの定義（HTTP 対応・意味）の正本は `BR-API-011`**。下表は開発者がとる対処を示す。

| `error.code` | 主な原因 | 開発者の対処 |
| --- | --- | --- |
| `BAD_REQUEST` | リクエスト形式・パラメータ誤り | リクエストの形式・必須項目を見直す |
| `UNAUTHORIZED` | キー欠如・無効・失効 | `Authorization` ヘッダとキーの有効性を確認。失効していれば再発行 |
| `FORBIDDEN` | スコープ外・他者リソースへの書き込み | `read` キーで書き込んでいないか、他者リソースを更新していないか確認（`full` が必要） |
| `NOT_FOUND` | 不存在・非公開（秘匿） | 相手が**実効公開**か確認。存在・状態は秘匿されるため区別できない前提で扱う |
| `VALIDATION_ERROR` | ビジネスルール違反（文字数・NSFW 等） | `error.details` のフィールド別違反を見て入力を修正（値の正本は [02-profile.md](../../service/features/02-profile.md)） |
| `RATE_LIMITED` | レート制限超過 | §6 に従い `Retry-After` 待機 + バックオフ |
| `INTERNAL_ERROR` | サーバー内部エラー | 時間をおいて再試行。再現する場合は運営へ問い合わせ |

## 8. 代表レシピ集

網羅的な仕様は Swagger UI と [05-public-api.md](../../service/features/05-public-api.md) を参照。ここでは代表的なユースケースのみ示す。

### 8.1 プロフィールを丸ごと更新する（`full` キー）

全体置換（冪等）。送らなかった項目は初期化される点に注意する。

```bash
curl -s -X PUT https://api.example.com/api/public/v1/me/profile \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{ "firstName": "…", "lastName": "…", "occupation": "…", "bio": "…" }'
```

### 8.2 一部だけ更新する（`full` キー）

部分更新。送ったフィールドのみ変更される。

```bash
curl -s -X PATCH https://api.example.com/api/public/v1/me/profile \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{ "occupation": "新しい職業" }'
```

### 8.3 自サイトに他者の公開プロフィールを埋め込む（`read` キー）

ブラウザに置くのは必ず `read` キー。実効公開のプロフィールのみ取得できる。

```js
const res = await fetch(`https://api.example.com/api/public/v1/profiles/${handle}`, {
  headers: { Authorization: `Bearer ${READ_KEY}` },
});
const body = await res.json();
if (body.success) render(body.data); // 非公開等は NOT_FOUND（§7）
```

## 9. FAQ / 制限事項

- **GraphQL は使えるか**: 公開 API は REST のみ。GraphQL は `client`/`admin` 向けの内部専用で外部公開しない（[01-graphql-internal.md](./01-graphql-internal.md) §1）。
- **他者の取得で必ず `NOT_FOUND` になる**: 相手が実効公開でない（非公開・未確認・凍結・退会・不存在）場合は、存在・状態を秘匿するため一律 `NOT_FOUND` となる（`BR-API-005`）。
- **`DELETE` でアカウントは消えるか**: 消えない。プロフィール内容を消去し非公開化するのみで、アカウントは存続する（画面から復旧可能、`BR-API-004`）。退会は公開 API では不可。
- **キーのスコープを後から変えたい**: 変更不可。失効して希望スコープで再発行する（`BR-API-001b`）。

## 10. 関連ドキュメント

- 公開 API 仕様の正本（エンドポイント・スコープ・エラー・レート制限・AC）: [05-public-api.md](../../service/features/05-public-api.md)
- 公開 REST API 設計規約（実装観点）: [02-public-rest-api.md](./02-public-rest-api.md)
- API 全体方針・横断原則: [00-overview.md](./00-overview.md)
- 用語の定義（公開 API・API キー・スコープ・エンベロープ 等）: [glossary.md](../../service/glossary.md) §6
