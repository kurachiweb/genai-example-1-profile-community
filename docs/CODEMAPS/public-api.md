# コードマップ — `apps/public-api`（公開 REST API）

公開 REST API（NestJS + MikroORM 7）のプロフィール共有縦スライス（ユニット `public-api-rest`）の構造マップ。
外部開発者向けに API キー認証で「本人プロフィールのフル CRUD」と「他者の実効公開分の Read」を提供する。
業務仕様の正本は [features/05-public-api.md](../service/features/05-public-api.md)、設計規約は [GUIDES/api/02-public-rest-api.md](../GUIDES/api/02-public-rest-api.md)・[GUIDES/coding/04-nestjs.md](../GUIDES/coding/04-nestjs.md)。

## レイヤ構成（クリーンアーキテクチャ）

依存は内向きのみ（Frameworks → Interface Adapters → Use Cases → Entities）。ドメイン/ユースケース層は
別 Worker 方針に従い `apps/api` から複製している（[ADR 20260617](../adr/20260617-public-api-domain-duplication.md)）。

```text
apps/public-api/src/
├── domain/                       # Entities(エンタープライズルール・複製＋公開API固有)
│   ├── errors.ts                 # エラー語彙(BR-API-011)・ドメイン例外(RateLimitError 追加)・HTTP 写像
│   ├── api-key.ts                # ★スコープ(read/full)・キー状態・書き込みスコープ判定(BR-API-001b)
│   ├── effective-public.ts       # 実効公開ゲート(BR-COMMON-007)
│   ├── user-status.ts            # 状態と編集可否(COMMON-2・BR-COMMON-005)
│   ├── text.ts / grapheme.ts     # NFC 正規化・不可視/制御文字除去・書記素計数(BR-COMMON-008/009)
│   ├── handle.ts / display-name.ts # ハンドル形式・予約語・表示名/検索名(BR-SHARE-001・BR-PROF-003/004)
│   ├── cursor.ts / limits.ts     # ULID カーソルの不透明エンコード・業務上限値
│   ├── sns-link.ts / profile-fields.ts # SNS/氏名/職業/自己紹介の検証(BR-PROF-002/005/006/007)
│
├── application/                  # Use Cases(Interactor・Gateway 宣言)
│   ├── gateways.ts               # User/ApiKey/Profile/SnsLink Repository・Clock・IdGenerator(DI トークン)
│   ├── models.ts                 # 境界レコード(ProfileRecord/ApiKeyRecord/ApiPrincipal 等)
│   └── public-profile.service.ts # 本人 CRUD(PUT/PATCH/DELETE)・他者公開 Read・カーソル一覧
│
├── infrastructure/               # Interface Adapters(Gateway 実装)+ Frameworks & Drivers
│   ├── persistence/
│   │   ├── entities/             # MikroORM 7 EntitySchema(users/profiles/sns_links/api_keys, db §5)
│   │   ├── mappers.ts            # エンティティ ↔ レコード変換
│   │   ├── user.repository.ts    # UserRepository 実装
│   │   ├── api-key.repository.ts # ★ApiKeyRepository(キーハッシュ照合・最終利用日時)
│   │   ├── profile.repository.ts # ProfileRepository(実効公開フィルタ・キーセットカーソル)
│   │   └── sns-link.repository.ts# SnsLinkRepository(全置換トランザクション・バッチ取得)
│   ├── mikro-orm.config.ts       # SQLite 設定(EntitySchema 登録・underscore・UTC)
│   ├── hashing.ts                # ★API キーの SHA-256 ハッシュ(node:crypto、BR-API-001)
│   ├── clock.ts / id-generator.ts# SystemClock / UlidGenerator
│   └── seed.ts                   # ローカル検証用(プロフィール＋ read/full 開発キー)
│
├── interface/rest/               # Interface Adapters(Controller/Presenter/横断)
│   ├── decorators/principal.decorator.ts # @Principal()・@RequireScope()
│   ├── guards/api-key.guard.ts   # 認証(Bearer→ハッシュ照合→active＋owner ACTIVE、BR-API-001/003)
│   ├── guards/scope.guard.ts     # スコープ(read/full・@RequireScope、BR-API-001b)
│   ├── guards/api-key-throttler.guard.ts # キー単位レート制限＋RateLimit-*/Retry-After(BR-API-008)
│   ├── interceptors/envelope.interceptor.ts # 共通エンベロープ整形(BR-COMMON-011)・Paginated
│   ├── filters/domain-error.filter.ts # 例外→コード→HTTP＋エンベロープ写像(BR-API-011)
│   ├── dto/                      # PutProfile/PatchProfile/SnsLink/ListProfilesQuery・ProfileView(OpenAPI)
│   ├── presenter.ts              # レコード→公開ビュー(非公開属性を出さない、BR-API-005)
│   ├── me-profile.controller.ts  # GET/PUT/PATCH/DELETE /me/profile
│   ├── profiles.controller.ts    # GET /profiles・GET /profiles/{handle}
│   ├── validation.ts             # ValidationPipe(ValidationError へ写像)
│   └── profile.module.ts         # 機能モジュール(Gateway・ガード・Throttler を束ねる)
│
├── config/env.ts                 # 起動時環境変数検証(ポート48034・レート制限しきい値)
├── app.module.ts                 # Composition root(MikroORM 結線・エンベロープ/例外フィルタ登録)
└── main.ts                       # bootstrap(:48034・/api/public/v1・CORS・Swagger UI)
```

## エンドポイント（操作の概要）

ベースパス `/api/public/v1`。認証 → レート制限 → スコープ の順でガードを適用する。正本は [features/05-public-api.md](../service/features/05-public-api.md) §3。

| メソッド・パス | スコープ | 認可・ゲート | 受け入れ条件 |
| --- | --- | --- | --- |
| `GET /me/profile` | `read` | 本人(非公開でも取得可) | AC-API-005 |
| `PUT /me/profile` | `full` | 本人・全体置換 | AC-API-009/010 |
| `PATCH /me/profile` | `full` | 本人・部分更新 | AC-API-008 |
| `DELETE /me/profile` | `full` | 本人・内容消去＋非公開化(アカウント存続) | AC-API-010 |
| `GET /profiles/{handle}` | `read` | 実効公開のみ・それ以外は `NOT_FOUND` 秘匿 | AC-API-006/007 |
| `GET /profiles` | `read` | 実効公開のみ(カーソルページング) | AC-API-006・BR-API-007 |

横断: 共通エンベロープ(`BR-COMMON-011`)・エラー写像(`BR-API-011`)・RateLimit-* ヘッダ(`AC-API-013`)・超過時 429+Retry-After(`AC-API-014`)・OpenAPI/Swagger UI(`/docs`、`BR-API-012`)。

## テスト

| 種別 | 場所 | 対象 |
| --- | --- | --- |
| 単体 | `src/domain/*.spec.ts` | ドメインの純粋ロジック(実効公開・正規化・検証・カーソル・スコープ) |
| 単体 | `src/application/public-profile.service.spec.ts` | ユースケース(フェイク Gateway で AC-API-005〜011b を網羅) |
| 単体 | `src/config/env.spec.ts` | 起動時環境変数検証 |
| 統合 | `test/public-api.e2e.spec.ts` | Nest Testing + Supertest(認証・スコープ・ゲート・エンベロープ・レート制限) |

合計 108 件 GREEN・ドメイン/ユースケースのカバレッジ 97%。テスト方針は [GUIDES/testing/01-unit-integration.md](../GUIDES/testing/01-unit-integration.md)。

> jest は MikroORM 7/kysely が ESM 専用のため **ESM モード**で実行する（`node --experimental-vm-modules`、[GUIDES/coding/06-mikroorm.md](../GUIDES/coding/06-mikroorm.md) §9）。

## 開発コマンド

```bash
pnpm --filter @app/public-api dev        # 開発サーバー(nest start --watch, :48034)
pnpm --filter @app/public-api test       # 単体・統合テスト(Jest・ESM)
pnpm --filter @app/public-api test:cov   # カバレッジ計測
pnpm --filter @app/public-api typecheck  # 型チェック(tsc --noEmit)
pnpm --filter @app/public-api build      # 本番ビルド(nest build)
pnpm --filter @app/public-api seed        # ローカル検証用サンプル＋開発キー投入
```

## 範囲外（後続ユニット）

API キーの発行/失効 UI・ユースケース（画面操作・再認証が必要、`BR-API-010`）、アイコン画像アップロードと NSFW 判定、レート制限カウンタの Durable Objects 実装（採用済み、[ADR 20260604](../adr/20260604-public-api-rate-limit-durable-objects.md)）、アカウント認証フロー・Trust&Safety・管理者コンソール・コンテンツ配信・メール送信。
