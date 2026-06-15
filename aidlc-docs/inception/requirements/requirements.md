# 要件分析（minimal） — ユニット `api-internal-profile`

> 業務要件・受け入れ条件の正本は [docs/service/features/](../../../docs/service/features/)（`BR-*`/`AC-*`）。本書は値を複製せず、内部 GraphQL API 実装としての対象範囲と非機能要件への対応所在のみを示す。

## 1. 意図分析

利用者の意図: 「`docs/` の設計仕様に基づき `apps/api`（内部 GraphQL API）の実装を完成させる」。`apps/api` は `client`/`admin`（Next.js）からのみ到達する内部専用の GraphQL 境界であり（[api/00-overview.md](../../../docs/GUIDES/api/00-overview.md) §1）、プロフィール共有サービスの中核ドメインを提供する。

## 2. 機能要件（本ユニットの対象）

サービス中核である Profile の取得・編集・公開制御を内部 GraphQL で提供する。

| # | 機能 | 正本 |
| --- | --- | --- |
| FR-1 | ハンドル指定での公開プロフィール取得（実効公開ゲート適用） | `BR-SHARE-006`/`BR-COMMON-007` |
| FR-2 | 公開プロフィール一覧（カーソルページング・氏名/職業/自己紹介検索） | `BR-DISC-003`/`BR-DISC-004` |
| FR-3 | 自分のプロフィール取得（本人はゲート非適用） | `AC-API-005` 相当 |
| FR-4 | プロフィール内容の更新（氏名・表示順・職業・自己紹介） | `BR-PROF-002`〜`006` |
| FR-5 | 公開/非公開の切り替え | `BR-SHARE-005` |
| FR-6 | ハンドルの変更（形式・予約語・一意性） | `BR-SHARE-001`/`002` |
| FR-7 | SNS リンクの一括設定（0〜10件・https のみ・種別） | `BR-PROF-007` |
| FR-8 | `Profile.snsLinks` の DataLoader バッチ解決（N+1 回避） | `api/01-graphql-internal.md` §5 |

## 3. 非機能要件（対応の所在）

| NFR | 方針 | 正本 |
| --- | --- | --- |
| 検証は境界で・単一ルール | class-validator + カスタムバリデータ（NFC 正規化・不可視文字除去・書記素計数） | `BR-COMMON-008`/`009` |
| 認可 | 所有権ベース（自リソースのみ書込可）＋実効公開ゲート | `api/01-graphql-internal.md` §6 |
| エラー写像 | ドメイン例外 → `extensions.code`（語彙は REST と一致） | `BR-API-011` |
| ページング | カーソル接続（`edges`/`pageInfo`）・ULID 不透明エンコード | `api/01-graphql-internal.md` §3 |
| N+1 対策 | DataLoader（リクエストスコープ） | `api/01-graphql-internal.md` §5 |
| 観測性・秘匿 | 秘匿値（メール等）を公開型に露出しない | `BR-API-005`/`BR-COMMON-014` |

## 4. 範囲外（後続ユニット）

アカウント認証フロー（登録/ログイン/メール確認/パスワード）・公開 REST API（`apps/public-api`）・API キー・Trust&Safety・管理者コンソール・コンテンツ配信・NSFW 判定・画像アップロード・メール送信・本番 Hono/Workers アダプタ・レート制限の実カウンタ（KV/DO）。

> これらは `docs/` で「実装に先行する設計仕様」として既に定義済み。本ユニットはその設計に整合する形で中核ドメインを実装し、後続ユニットが同じ層構造を踏襲できる土台を作る。
