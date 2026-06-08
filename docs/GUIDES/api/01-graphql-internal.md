# 内部 GraphQL API 設計規約 — GenAI Profile Community

内部 API（`apps/api`、NestJS + Apollo Server）の GraphQL スキーマ設計・エラー表現・N+1 対策・型生成の規約を定義する。

> **位置づけ**: 本ガイドは横断原則（[00-overview.md](./00-overview.md)）を内部 GraphQL に具体化したものである。
> フィールドの文字数・件数・必須・状態列挙などの**具体値は features/ が正本**であり、本ガイドは値を持たず参照する（[02-profile.md](../../service/features/02-profile.md) ほか）。エンティティの物理定義は [db/01-data-model.md](../db/01-data-model.md) §5 が正本。
> **現状フェーズ**: `apps/api` は未実装で、本ガイドは実装に先行する設計規約である。確定したスキーマ（SDL）は実装時に生成物として別管理し、本ガイドには規約のみを記す（SDL 断片は載せない）。

## 1. 位置づけと責務境界

- 内部 GraphQL API は `client`/`admin`（Next.js）からのみ到達する**内部専用**の境界であり、外部公開はしない（[infra/01-network-architecture.md](../infra/01-network-architecture.md) §1 ドメイン分離）。
- 認証は呼び出し元の Cookie セッションを引き継ぐ（利用者・管理者でストア分離、`BR-COMMON-001`/`002`）。
- 公開 REST API（`apps/public-api`）とは独立した境界であり、スキーマ・認証・デプロイを共有しない。外部開発者向けの面は [02-public-rest-api.md](./02-public-rest-api.md) を参照。

## 2. スキーマ設計規約

### 2.1 命名規約

| 対象 | 規約 | 補足 |
| --- | --- | --- |
| 型（Type / Interface / Union） | PascalCase | ドメインの名詞に対応（`User`, `Profile`, `SnsLink` 等） |
| フィールド・引数 | camelCase | DB の snake_case とはリゾルバ/マッパで対応づける（[db/00-overview.md](../db/00-overview.md) §3） |
| 列挙（enum） | 値は features/ の表記に一致 | 状態は `COMMON-2` の `S-USER-*`、`platform` 等は [02-profile.md](../../service/features/02-profile.md) の表記に揃える |
| Mutation | 動詞 + 対象（`updateProfile` 等） | 入出力は §2.3 の規約に従う |
| 入力型 / ペイロード型 | `<Mutation>Input` / `<Mutation>Payload` | §2.3 参照 |

### 2.2 スカラと識別子

- 日時は UTC の ISO-8601 を表す専用スカラ（`DateTime`）で表現する。表示時のローカルタイム変換は消費側で行う（`BR-COMMON-015`）。
- ID は不透明（opaque）として扱い、**内部 ULID をそのまま公開・列挙させない**方針と整合させる（[db/00-overview.md](../db/00-overview.md) §4、`BR-SHARE-006`）。公開識別子はハンドルであり、内部 ID は推測・列挙の手がかりにしない。
- 自由入力文字列は境界で検証・正規化済みの値のみを受け取る（§検証は [00-overview.md](./00-overview.md) §2.1）。

### 2.3 Query / Mutation の設計指針

- **Query** は副作用を持たない読み取りに限定する。一覧・検索はカーソル接続（§3）を返す。
- **Mutation** は 1 操作 1 ミューテーションを基本とし、引数は単一の `Input` 型に集約、戻り値は `Payload` 型に包む（将来のフィールド追加・部分エラー表現に備える）。
- 実効公開ゲート（§6）・認可（§6）はリゾルバ手前のガード／サービス層で評価し、リゾルバ本体には漏らさない。
- v1 で提供する操作の範囲は features/（プロフィール・アカウント・管理者・Trust&Safety 等の各仕様）に従う。GraphQL 固有の操作を新設しない。

### 2.4 ドメインと GraphQL 型の対応

GraphQL 型は features/ のエンティティに対応させる。**フィールドの定義値（長さ・必須・件数）は持たず**、物理定義は [db/01-data-model.md](../db/01-data-model.md) §5、業務ルールは features/ を参照する。

| GraphQL 型（想定） | 対応エンティティ | 正本 |
| --- | --- | --- |
| `User` | ユーザーアカウント | [01-user-account.md](../../service/features/01-user-account.md) / db §5.1 |
| `Profile` | プロフィール | [02-profile.md](../../service/features/02-profile.md) / db §5.2 |
| `SnsLink` | SNS/Web リンク | `BR-PROF-007` / db §5.3 |
| `ApiKey` | 公開 API キー | [05-public-api.md](../../service/features/05-public-api.md) / db §5.4 |
| 管理者・通報・凍結・お知らせ 等 | Trust&Safety / 管理者 / コンテンツ | [06](../../service/features/06-trust-and-safety.md)/[07](../../service/features/07-admin-console.md)/[08](../../service/features/08-content-and-comms.md) / db §5.7〜§5.14 |

- 非公開属性（メールアドレス・キー秘匿値 等）は公開系の型・フィールドに露出させない。表示可能なフィールドは公開ページの表示内容に準じる（`BR-API-005`、`BR-SHARE-006`）。

## 3. ページング（カーソル接続）

- 一覧・検索は Relay 風のカーソル接続（`edges { node, cursor }` と `pageInfo { hasNextPage, endCursor }`）で表現する。OFFSET ページングは用いない（[db/00-overview.md](../db/00-overview.md) §6）。
- カーソルは ULID（または複合キー）を不透明文字列にエンコードして返し、消費側で構造を解釈させない。
- 既定件数・最大件数は再掲しない。正本は `BR-DISC-003`（[04-profile-discovery.md](../../service/features/04-profile-discovery.md)）。公開 REST の `meta.nextCursor` 表現との対応は [02-public-rest-api.md](./02-public-rest-api.md) §7。

## 4. エラー表現

- GraphQL エラーは `extensions.code` にドメイン由来のコードを載せて表現する。コードの**語彙**は公開 REST のエラーコード（`BR-API-011`）と一致させ、面をまたいでも同じ意味になるようにする（HTTP 数値の正本は [05-public-api.md](../../service/features/05-public-api.md) §5。本ガイドでは数値表を再掲しない）。
- 想定済みのドメイン例外（検証違反・認可違反・不存在/秘匿 等）は `extensions.code` 付きで返し、想定外の内部エラーはコードを一般化して詳細を構造化ログにのみ残す（`BR-COMMON-012`/`014`）。
- 部分的に取得できるクエリでは、取得できないフィールドを `null` とし `errors` にパスを示す方針とする（全体を失敗させない）。Mutation の業務エラーは `Payload` 型のエラーフィールドでも表現できるようにし、トランスポートエラーと区別する。
- 利用者向けメッセージは日本語・一般化（情報漏えい防止、`BR-COMMON-012`）。

## 5. N+1 と DataLoader

- N+1 は **DataLoader** でバッチ化する。バッチ対象（Profile→SnsLink、一覧→各 Profile のアイコン解決 等）の正本は [infra/01-network-architecture.md](../infra/01-network-architecture.md) §5。本ガイドは実装規約に限定する。
- loader は**リクエストスコープ**で生成し、リクエストをまたいでキャッシュを共有しない（古いデータ・権限混線を防ぐ）。
- loader の粒度はキー（ID）単位のバッチ取得を基本とし、フィルタ条件付きの取得は loader 化せずサービス層で扱う。
- 実効公開・認可で除外される要素は loader の結果段階で確実に落とす（取得後フィルタの漏れを作らない）。

## 6. 認可

- **所有権ベース**: 自ユーザーのリソースのみ変更可能とする。他者リソースへの書き込みは拒否する。
- **ロールベース**: 管理者操作は admin セッション・権限で制御する（[07-admin-console.md](../../service/features/07-admin-console.md)）。利用者セッションと管理者セッションはストア分離（`BR-COMMON-002`）。
- **実効公開ゲート**: 他者の読み取りは実効公開のみを返し、非公開・未確認・凍結・退会・不存在は秘匿する。判定式は再掲せず `BR-COMMON-007` を参照する（適用箇所＝一覧/検索/単体取得のリゾルバ手前）。
- 認可・ゲートは NestJS のガード／サービス層に集約し、各リゾルバへ散在させない。

## 7. 型生成と探索ツール

- スキーマと TypeScript 型の整合は **GraphQL Code Generator** で自動化する。スキーマ駆動（schema-first）かコード駆動（code-first）かは実装着手時に確定し、本ガイドへ追記する。いずれでも「スキーマを単一の真実とし、型を生成物として扱う」方針は変えない。
- 生成物（型・operation 別フック等）はバージョン管理の扱いを定め、`client`/`admin` と共有して画面側の型安全を担保する。
- GraphQL Playground / Apollo の探索 UI は **dev/local 限定で有効**化し、本番では無効化する（内部 API を外部から探索させない）。
- 公開 API の探索は GraphQL ではなく Swagger UI が担う（[02-public-rest-api.md](./02-public-rest-api.md) §9・`BR-API-012`）。

## 8. 関連ドキュメント

- API 全体方針・横断原則: [00-overview.md](./00-overview.md)
- 公開 REST API 設計規約（エラーコード語彙・カーソル表現の対応先）: [02-public-rest-api.md](./02-public-rest-api.md)
- 内部通信・DataLoader 対象・経路: [infra/01-network-architecture.md](../infra/01-network-architecture.md) §5
- エンティティ物理定義・インデックス: [db/01-data-model.md](../db/01-data-model.md) §5・§6
- 横断ルール（状態・検証・正規化・公開ゲート・メッセージ）: [00-common-rules.md](../../service/features/00-common-rules.md)
