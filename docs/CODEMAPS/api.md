# コードマップ — `apps/api`（内部 GraphQL API）

内部 GraphQL API（NestJS + Apollo Server + MikroORM）のプロフィール共有コアドメイン（ユニット `api-internal-profile`）の構造マップ。
設計規約の正本は [GUIDES/api/01-graphql-internal.md](../GUIDES/api/01-graphql-internal.md)・[GUIDES/coding/01-architecture.md](../GUIDES/coding/01-architecture.md) §2・[GUIDES/coding/04-nestjs.md](../GUIDES/coding/04-nestjs.md)。

## レイヤ構成（クリーンアーキテクチャ）

依存は内向きのみ（Frameworks → Interface Adapters → Use Cases → Entities）。

```text
apps/api/src/
├── domain/                       # Entities(エンタープライズルール・フレームワーク非依存)
│   ├── errors.ts                 # エラーコード語彙(BR-API-011)・ドメイン例外・HTTP 写像
│   ├── user-status.ts            # 状態と許可遷移(COMMON-2)・編集可否(BR-COMMON-005)
│   ├── effective-public.ts       # 実効公開ゲート(BR-COMMON-007)
│   ├── text.ts                   # NFC 正規化・不可視/制御文字除去(BR-COMMON-008/009)
│   ├── grapheme.ts               # 書記素クラスタ単位の文字数計数
│   ├── handle.ts                 # ハンドル形式・予約語(BR-SHARE-001/002)
│   ├── display-name.ts           # 表示名組み立て・検索名導出(BR-PROF-003/004・BR-DISC-004)
│   ├── cursor.ts                 # ULID カーソルの不透明エンコード/デコード
│   ├── limits.ts                 # 業務上限値の名前付き定数(値の正本は features/)
│   ├── sns-link.ts               # SNS 種別・https のみ・件数/長さ検証(BR-PROF-007)
│   └── profile-fields.ts         # 氏名/職業/自己紹介の検証・正規化(BR-PROF-002/005/006)
│
├── application/                  # Use Cases(Interactor・Gateway 宣言)
│   ├── gateways.ts               # UserRepository/ProfileRepository/SnsLinkRepository/Clock/IdGenerator(DI トークン)
│   ├── models.ts                 # 境界をまたぐプレーンレコード(ProfileRecord/SnsLinkRecord/Viewer)
│   ├── profile.service.ts        # プロフィール取得/一覧/更新/公開切替/ハンドル変更/SNS 一括設定
│   └── policy.service.ts         # 規約・プライバシーポリシーの公開閲覧(PublicPolicyService、認可不要、BR-CONTENT-010)。
│                                  #   Gateway は application/admin/content-gateways.ts(POLICY_REPOSITORY)を再利用
│
├── infrastructure/               # Interface Adapters(Gateway 実装)+ Frameworks & Drivers
│   ├── persistence/
│   │   ├── entities/             # MikroORM 7 EntitySchema(users/profiles/sns_links, db §5。v7 はデコレータ廃止)
│   │   ├── mappers.ts            # エンティティ ↔ レコード変換
│   │   ├── user.repository.ts    # UserRepository 実装
│   │   ├── profile.repository.ts # ProfileRepository 実装(実効公開フィルタ・キーセットカーソル)
│   │   └── sns-link.repository.ts# SnsLinkRepository 実装(全置換トランザクション・バッチ取得)
│   ├── mikro-orm.config.ts       # SQLite 設定(underscore 命名・UTC・FK)
│   ├── clock.ts / id-generator.ts# SystemClock / UlidGenerator(Gateway 実装)
│   └── seed.ts                   # ローカル開発用シード
│
├── interface/graphql/            # Interface Adapters(Controller/Presenter)
│   ├── types/                    # ObjectType/InputType/Args/Payload(code-first)
│   ├── presenter.ts              # レコード → ViewModel 変換(表示名導出)
│   ├── profile.resolver.ts       # Query/Mutation・snsLinks フィールドリゾルバ
│   ├── sns-link.loader.ts        # DataLoader(N+1 回避・リクエストスコープ)
│   ├── domain-error.filter.ts    # ドメイン例外 → extensions.code 写像
│   ├── validation.ts             # ValidationPipe(ValidationError へ写像)
│   ├── viewer.provider.ts        # 閲覧者解決(Cookie セッションのスタンドイン)
│   ├── profile.module.ts         # Profile 機能モジュール(Gateway をトークンで束ねる)
│   ├── policy.resolver.ts        # 規約公開閲覧 Query(publicPolicy/publicPolicyVersions/publicPolicyVersion)。ログイン不要
│   ├── policy.module.ts          # Policy 公開閲覧モジュール(POLICY_REPOSITORY を admin 側と共有)
│   ├── help-article.resolver.ts  # ヘルプ記事公開閲覧 Query(publicHelpArticles/publicHelpArticle)。ログイン不要
│   └── help-article.module.ts    # HelpArticle 公開閲覧モジュール(HELP_ARTICLE_REPOSITORY を admin 側と共有)
│
├── config/env.ts                 # 起動時の環境変数検証
├── app.module.ts                 # Composition root(MikroORM/Apollo 結線・例外フィルタ)
└── main.ts                       # bootstrap(:48031・dev はスキーマ自動同期)
```

## GraphQL スキーマ(操作の概要)

| 種別 | 操作 | 認可・ゲート | 正本 |
| --- | --- | --- | --- |
| Query | `profile(handle)` | 実効公開のみ・それ以外は `NOT_FOUND` で秘匿 | `BR-SHARE-006`/`BR-COMMON-007` |
| Query | `profiles(first, after, search)` | 実効公開のみ(カーソル接続) | `BR-DISC-003/004` |
| Query | `myProfile` | 本人(Cookie セッション)・未ログインは `UNAUTHORIZED` | `AC-API-005` |
| Mutation | `updateProfile(input)` | 所有権・FROZEN は不可 | `BR-PROF-002〜006` |
| Mutation | `updateProfileVisibility(input)` | 所有権 | `BR-SHARE-005` |
| Mutation | `changeHandle(input)` | 所有権・形式/予約語/一意性 | `BR-SHARE-001/002` |
| Mutation | `replaceSnsLinks(input)` | 所有権・0〜10 件/https | `BR-PROF-007` |
| Field | `Profile.snsLinks` | DataLoader でバッチ解決 | `api/01-graphql-internal.md` §5 |
| Query | `publicPolicy(type)` | ログイン不要・発効中の版のみ、未発行は `null` | `BR-CONTENT-010` |
| Query | `publicPolicyVersions(type)` | ログイン不要・過去版含む全版(版番号降順) | `BR-CONTENT-010`/`AC-CONTENT-011` |
| Query | `publicPolicyVersion(type, version)` | ログイン不要・版番号指定、無ければ `null` | `BR-CONTENT-010`/`AC-CONTENT-011` |
| Query | `publicHelpArticles` | ログイン不要・公開状態の記事のみ | `BR-CONTENT-005`/`AC-CONTENT-005b` |
| Query | `publicHelpArticle(slug)` | ログイン不要・公開状態のみ、非公開/不在は `null` | `BR-CONTENT-005`/`AC-CONTENT-005` |

## テスト

| 種別 | 場所 | 対象 |
| --- | --- | --- |
| 単体 | `src/domain/*.spec.ts` | ドメインの純粋ロジック(実効公開・正規化・検証・カーソル 等) |
| 単体 | `src/application/profile.service.spec.ts` | ユースケース(フェイク Gateway で AC を網羅) |
| 単体 | `src/config/env.spec.ts` | 起動時環境変数検証 |
| 統合 | `test/profile-repository.spec.ts` | MikroORM 永続化層(インメモリ SQLite) |
| 統合 | `test/graphql-profile.spec.ts` | Nest Testing + Supertest(認可・ゲート・カーソル・DataLoader) |
| 単体 | `src/application/policy.service.spec.ts` | 規約公開閲覧ユースケース(発効中取得/過去版一覧/版指定取得) |
| 統合 | `test/graphql-public-policy.spec.ts` | 未ログインでの公開規約取得・境界検証(Nest Testing + Supertest) |
| 単体 | `src/application/help-article.service.spec.ts` | ヘルプ記事公開閲覧ユースケース(公開のみ一覧/スラッグ取得) |
| 統合 | `test/graphql-public-help-article.spec.ts` | 未ログインでの公開ヘルプ記事取得・境界検証(Nest Testing + Supertest) |

合計 107 件 GREEN・ドメイン/ユースケースのカバレッジ 98%(規約・ヘルプ記事公開閲覧の追加分は別カウント、リポジトリ全体のテスト件数は README/CHANGELOG 参照)。テスト方針は [GUIDES/testing/01-unit-integration.md](../GUIDES/testing/01-unit-integration.md)。

## 開発コマンド

```bash
pnpm --filter @app/api dev        # 開発サーバー(nest start --watch, :48031)
pnpm --filter @app/api test       # 単体・統合テスト(Jest)
pnpm --filter @app/api test:cov   # カバレッジ計測
pnpm --filter @app/api typecheck  # 型チェック(tsc --noEmit)
pnpm --filter @app/api build      # 本番ビルド(nest build)
pnpm --filter @app/api seed       # ローカル開発用サンプル投入
```

## 範囲外(後続ユニット)

アカウント認証フロー・公開 REST API(`apps/public-api`)・API キー・Trust&Safety・管理者コンソール・コンテンツ配信・NSFW 判定・画像/メール・本番 Hono/Workers アダプタ・レート制限の実カウンタ(KV/DO)。
