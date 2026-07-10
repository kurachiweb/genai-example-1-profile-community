# ADR: 本番/dev(Cloudflare Workers)のメール送信(Amazon SES)実装方式 — aws4fetch を採用

- **ステータス**: 承認済み(Accepted)
- **日付**: 2026-07-10
- **対象**: `apps/api/src/infrastructure/ses-mail-sender.ts` / `docs/GUIDES/infra/00-overview.md` §3

## 文脈

本番/dev(Cloudflare Workers)でのメール送信(確認メール・パスワードリセット等)は、当初 CLAUDE.md の技術選定に従い `@aws-sdk/client-ses`(AWS SDK for JavaScript v3)で実装した。

`wrangler deploy --dry-run` によるバンドル検証・実 AWS SES への疎通テスト(Node.js 上)はいずれも成功したが、実際に Cloudflare Workers(`genai-example-1-api-dev`)へデプロイし新規登録を実行したところ、`SESClient` の構築時に以下の例外が発生し、メール送信(ひいては新規登録全体)が失敗した。

```
TypeError: emitWarningIfUnsupportedVersion$1 is not a function
    at getRuntimeConfig (worker.js:306907:7)
    at new SESClient (worker.js:306982:27)
```

`emitWarningIfUnsupportedVersion` は `@aws-sdk/core` が Node.js ランタイムのバージョンを検知して非推奨警告を出すための、**Node.js 専用のランタイム検知コード**である。esbuild(Wrangler のバンドラ)がこのコードパスを Workers 向けにバンドルする際、依存解決が壊れて未定義関数の呼び出しになる(`wrangler.jsonc` に既存の NestJS/Apollo 向け `alias` 回避策と同種の、AWS SDK 側の esbuild/Workers 条件解決の問題)。`--dry-run` はバンドルの構文的な成立のみを検証し、この種のランタイム専有コードの実行時失敗までは検出できない。

## 検討した選択肢

### 選択肢 A: `@aws-sdk/client-ses` のまま、esbuild の `alias`/`conditions` で回避する

- **Pros**: CLAUDE.md の当初の技術選定を維持できる。
- **Cons**: 原因が AWS SDK 内部の Node ランタイム検知コードに起因し、`wrangler.jsonc` の `alias` で個別モジュールを差し替える対症療法では再発しやすい(他の Node 専用コードパスが別の呼び出しで踏まれる可能性が残る)。AWS SDK v3 フルパッケージは Worker バンドルも肥大する(実測 Total Upload 12938 KiB)。

### 選択肢 B: `aws4fetch` で SESv2 REST API を直接呼ぶ(採用)

- **Pros**: `aws4fetch` は fetch ベースの軽量 SigV4 署名ライブラリで、Node 固有のランタイム検知コードを一切持たない(Workers/Deno/ブラウザ/Node で同一コードパス)。既に `docs/adr/20260603-nsfw-moderation-rekognition.md` で Amazon Rekognition 呼び出しに同ライブラリを採用した実績があり、パターンが確立している。バンドルサイズが軽量(実測 Total Upload 11863 KiB、約 8% 減)。
- **Cons**: SES の REST API(SESv2 `SendEmail`)呼び出しを手組みする必要があり、AWS SDK が提供する型安全な入力バリデーションは失われる(送信内容は `MailMessage` インターフェース経由の内部呼び出しのみのため実害は小さい)。

## 決定

**選択肢 B を採用する。`SesMailSender` は `aws4fetch`(`AwsClient`)で SESv2 の `POST /v2/email/outbound-emails` を直接呼び出す。**

- `@aws-sdk/client-ses`・`@smithy/fetch-http-handler` は `apps/api/package.json` から削除する。
- 実際に AWS SES(SESv2 REST API)へ `aws4fetch` 経由でテストメールを送信し、`MessageId` が返る成功を確認済み(Node.js 上)。加えて `wrangler deploy --dry-run` のバンドル出力に `emitWarningIfUnsupportedVersion` が含まれないことを確認済み。

## 結果・影響

### 正の影響

- Workers ランタイムでの起動時例外を根本的に回避する(Node 専用コードパスを持ち込まない)。
- Rekognition と同一パターンのため、今後 AWS サービスを Workers から呼ぶ際の標準アプローチとして再利用しやすい。
- バンドルサイズが軽量化する。

### 負の影響・トレードオフ

- AWS SDK の型安全性・自動リトライ等の恩恵を失う。`SesMailSender.send()` は非 2xx 応答を例外として呼び出し元(`UserService`)へ伝播させるのみで、SDK 相当の詳細なリトライ制御は持たない。将来リトライが必要になった場合は `SesMailSender` 内で追加実装する。

## 将来の見直しトリガ

- AWS SDK v3 が Cloudflare Workers ランタイムを正式サポートし、この種のランタイム検知コードが Workers 環境で正しく動作するようになった場合。
- SES 呼び出しにリトライ・レート制限等の高度な制御が必要になり、手組みの REST 呼び出しでは複雑化が過ぎる場合。

## 関連

- CLAUDE.md 技術選定(メール送信)
- インフラ: [docs/GUIDES/infra/00-overview.md](../GUIDES/infra/00-overview.md) §3
- 先例(同一パターン): [20260603-nsfw-moderation-rekognition.md](./20260603-nsfw-moderation-rekognition.md)
