# コード生成計画 — ユニット `public-api-rest`

TDD（RED→GREEN→REFACTOR）で実装する。チェックは完了時に `[x]` へ更新する。

## ディレクトリ構成（`apps/public-api/`）

```text
apps/public-api/src/
├── domain/                         # Entities（apps/api から複製＋ api-key）
│   ├── errors.ts                   # エラー語彙・ドメイン例外・HTTP 写像（BR-API-011）
│   ├── user-status.ts              # 状態・編集可否（COMMON-2・BR-COMMON-005）
│   ├── effective-public.ts         # 実効公開ゲート（BR-COMMON-007）
│   ├── text.ts / grapheme.ts       # 正規化・書記素計数（BR-COMMON-008/009）
│   ├── handle.ts / display-name.ts # ハンドル/表示名（BR-SHARE-001・BR-PROF-003/004）
│   ├── cursor.ts / limits.ts       # カーソル・上限値
│   ├── sns-link.ts / profile-fields.ts # 入力検証（BR-PROF-002/005/006/007）
│   └── api-key.ts                  # ★新規: スコープ（read/full）・キー状態・スコープ判定
├── application/
│   ├── gateways.ts                 # Repository/Clock の DI トークン（＋ ApiKeyRepository）
│   ├── models.ts                   # ProfileRecord/SnsLinkRecord/ApiKeyRecord/ApiPrincipal
│   └── public-profile.service.ts   # 本人 CRUD・他者公開 Read・一覧
├── infrastructure/
│   ├── persistence/entities/       # users/profiles/sns_links/api_keys（db §5）
│   ├── persistence/*.repository.ts # Gateway 実装（api_keys のハッシュ照合含む）
│   ├── persistence/mappers.ts
│   ├── mikro-orm.config.ts
│   ├── hashing.ts                  # ★新規: SHA-256 キーハッシュ（node:crypto）
│   ├── clock.ts / id-generator.ts
│   └── seed.ts                     # ローカル検証用（プロフィール＋ API キー）
├── interface/rest/
│   ├── guards/api-key.guard.ts     # 認証（Bearer→ハッシュ照合→active＋owner 実効）
│   ├── guards/scope.guard.ts       # スコープ（read/full・@RequireScope）
│   ├── guards/api-throttler.guard.ts # キー単位レート制限＋ RateLimit-* ヘッダ
│   ├── interceptors/envelope.interceptor.ts # 共通エンベロープ（BR-COMMON-011）
│   ├── filters/domain-error.filter.ts # 例外→コード→HTTP＋エンベロープ（BR-API-011）
│   ├── dto/                        # PutProfile/PatchProfile/SnsLink/ListProfiles
│   ├── decorators/                 # @Principal()・@RequireScope()
│   ├── presenter.ts                # レコード→公開ビュー（非公開属性を出さない）
│   ├── me-profile.controller.ts    # GET/PUT/PATCH/DELETE /me/profile
│   ├── profiles.controller.ts      # GET /profiles・GET /profiles/{handle}
│   ├── validation.ts               # ValidationPipe→ValidationError
│   └── profile.module.ts
├── config/env.ts                   # 起動時環境変数検証（＋ レート制限しきい値）
├── app.module.ts                   # MikroORM/Throttler 結線・グローバル filter/interceptor
└── main.ts                         # bootstrap（:48034・Swagger・グローバル pipe）
```

## タスク

- [x] T1. 雛形（package.json・tsconfig・nest-cli・jest・eslint・prettier・gitignore）と AI-DLC ドキュメント
- [x] T2. ドメイン層複製＋ `api-key.ts`（スコープ・状態）＋単体テスト
- [x] T3. ユースケース層（Gateway・`PublicProfileService`）＋フェイク Gateway 単体テスト（AC-API-005〜011b を網羅）
- [x] T4. 永続化層（`api_keys` エンティティ・各リポジトリ・`hashing`・MikroORM 設定・seed）
- [x] T5. REST 層（ガード〔認証/スコープ/レート〕・Interceptor・フィルタ・DTO・コントローラ・Presenter・Swagger）＋統合テスト
- [x] T6. アプリ起動（AppModule・main・Throttler・env 検証）
- [x] T7. ドキュメント更新（CODEMAPS/public-api・README・CHANGELOG・GUIDES 現状フェーズ）

## 受け入れ条件の対応（features/05-public-api.md §6）

| AC | 検証層 |
| --- | --- |
| AC-API-004（失効キーは 401） | 統合（認証ガード） |
| AC-API-005（本人取得・非公開でも可） | ユースケース単体＋統合 |
| AC-API-006（他者公開取得・非公開属性なし） | ユースケース単体＋統合（Presenter） |
| AC-API-007（非公開/未確認/凍結は 404 秘匿） | ユースケース単体＋統合 |
| AC-API-008（PATCH 部分更新） | ユースケース単体＋統合 |
| AC-API-009（バリデーション 422・details） | ユースケース単体＋統合 |
| AC-API-010（DELETE は消去＋非公開化・アカウント存続） | ユースケース単体＋統合 |
| AC-API-011（他者書き込み不可）/011b（read キー書き込み 403） | ユースケース単体＋統合（スコープガード） |
| AC-API-012（退会は API 不可＝エンドポイント無し） | 統合（404） |
| AC-API-013（RateLimit-* ヘッダ） | 統合 |
| AC-API-014（60→61 で 429＋Retry-After） | 統合 |
