# アーキテクチャ設計 — GenAI Profile Community

モノレポ全体の構造と、バックエンド（クリーンアーキテクチャ）・フロントエンドの責務分割・状態管理・境界設計を定義する。
原則は [00-overview.md](./00-overview.md)、ツールは [02-lint-format-commit.md](./02-lint-format-commit.md) を参照。

> **位置づけ**: 本ガイドは [CLAUDE.md](../../../CLAUDE.md)（技術選定・ディレクトリ構成）と [docs/GUIDES/infra/](../infra/)（アプリ構成・経路）を、コード構造の観点へ具体化したものである。
> アプリ構成・経路・データストア配置の正本は [infra/00-overview.md](../infra/00-overview.md)・[infra/01-network-architecture.md](../infra/01-network-architecture.md)、API の設計規約は [docs/GUIDES/api/](../api/)、物理データモデルは [db/01-data-model.md](../db/01-data-model.md)。
> **現状フェーズ**: `apps/` 配下は未実装で、本ガイドは実装に先行する設計規約である。

## 1. モノレポ構成

- **pnpm ワークスペース**による単一リポジトリ。`apps/` 配下に各アプリを置き、共有設定（`tsconfig` ベース・ESLint・Prettier・Commitlint）はルートに集約する（[CLAUDE.md](../../../CLAUDE.md) ディレクトリ構成）。
- アプリ間の依存は明示的に保つ。`client`/`admin` は内部 GraphQL（`api`）越しにのみドメインへ到達し、`api`/`public-api` を直接 import しない。
- アプリ一覧・役割・ポート・デプロイ先の正本は [infra/00-overview.md](../infra/00-overview.md) §2。本ガイドでは再掲しない。

### アプリ境界の原則

| 境界 | 方針 | 根拠 |
| --- | --- | --- |
| `api`（内部 GraphQL）と `public-api`（公開 REST） | **別アプリ・別 Worker・別認証・別境界**。スキーマ・認証・デプロイを共有しない | 攻撃面と進化速度の分離（[api/00-overview.md](../api/00-overview.md) §1） |
| `client`（利用者）と `admin`（管理者） | **別アプリ・別ドメイン・別セッション** | 権限影響の分離（`BR-COMMON-002`） |
| 共有ドメインルール | 文字数・状態・公開ゲート等の**業務値は features/ を単一の真実**とし、各アプリは参照する | 検証ルールの単一化（`BR-COMMON-008`/`009`） |

## 2. バックエンド：クリーンアーキテクチャ（`api` / `public-api`）

NestJS を**クリーンアーキテクチャ**で構成する（[CLAUDE.md](../../../CLAUDE.md)）。同心円の層（Entities / Use Cases / Interface Adapters / Frameworks & Drivers）・依存性ルール（依存は内向きのみ）・Input/Output Boundary・Gateway・Controller/Presenter・Composition root などの**概念と実装パターンは [`clean-architecture` スキル](../../../.claude/skills/clean-architecture/SKILL.md) を正本**とする。本ガイドは概念・依存性ルール・コード例を再掲せず、**本サービス固有の対応づけ**に限定する。

### 2.1 構成要素と層の対応

スキルが定義する各層を、本サービスの具体要素へ対応づける（層の責務定義そのものはスキルを参照）。

| 層（スキル定義） | 本サービスの該当要素 |
| --- | --- |
| Entities | User/Profile/SnsLink/ApiKey/Report 等のエンタープライズルール。実効公開判定（`BR-COMMON-007`）・状態遷移（`COMMON-2`）等の純粋ロジック。NestJS/MikroORM/Cloudflare に非依存 |
| Use Cases | アプリケーションのワークフロー（Interactor）。トランザクション境界・認可/ゲートの呼び出し。**Gateway と Input/Output Boundary は本層で宣言**する |
| Interface Adapters | GraphQL リゾルバ・REST コントローラ（Controller）、レスポンス整形（Presenter）、**MikroORM リポジトリ＝Gateway 実装**、外部サービスアダプタ（R2/Images/SES/Rekognition/KV/DO の Gateway 実装） |
| Frameworks & Drivers | NestJS・Hono・Apollo Server・MikroORM・Cloudflare（D1/KV/DO/R2/Images）・SES/Rekognition SDK。設定と結線が中心 |
| Composition root（Main） | NestJS の DI コンテナ。モジュールの `providers` で Gateway/Presenter 実装を Use Case へ束ね、依存を内側へ漏らさない |

### 2.2 本サービス固有の適用

スキルに無い、本サービス固有の適用上の約束のみを示す。

- **外部 I/O はすべて Gateway 経由**: D1（リポジトリ）・R2・Images・SES・Rekognition・KV・DO は Use Case 層が宣言する Gateway 越しに呼ぶ。これによりテスト時に Gateway をフェイク/決定論的スタブへ差し替える（Rekognition スタブ等、[testing/01-unit-integration.md](../testing/01-unit-integration.md) §3）。
- **認可・実効公開ゲートの集約**: 所有権ベース／ロールベースの認可と実効公開ゲートは、NestJS のガード／Use Case 層に集約し、リゾルバ/コントローラ本体や各所へ散在させない（[api/01-graphql-internal.md](../api/01-graphql-internal.md) §6）。
- **DataLoader はリクエストスコープ**: N+1 対策の DataLoader は内部 GraphQL 固有で、リクエストごとに生成する（[api/01-graphql-internal.md](../api/01-graphql-internal.md) §5）。
- **Workers ランタイム差の吸収**: NestJS は **Hono** アダプタで Workers 上に動かす（[CLAUDE.md](../../../CLAUDE.md)・[infra/00-overview.md](../infra/00-overview.md) §2）。ランタイム差異は Interface Adapters / Frameworks & Drivers で吸収し、Entities / Use Cases に持ち込まない。

## 3. フロントエンド：Next.js（App Router）（`client` / `admin`）

### 3.1 コンポーネント設計

- **Server / Client Components の境界**を意図的に設計する。データ取得・秘匿値は Server 側に置き、`'use client'` は対話・状態が必要なリーフに限定する。
- **コンテナ / プレゼンテーション分割**: データ取得・副作用はコンテナが持ち、表示コンポーネントは props を受け取る純粋な描画に保つ（[ecc-web/patterns.md](../../../.claude/rules/ecc-web/patterns.md)）。
- 共有 UI は機能/サーフェス単位でディレクトリ化する。プリミティブは **shadcn/ui** をベースに、テンプレート然としない意図的な装いへ調整する（[ecc-web/coding-style.md](../../../.claude/rules/ecc-web/coding-style.md)・[ecc-web/design-quality.md](../../../.claude/rules/ecc-web/design-quality.md)）。コンポーネントカタログは [docs/apps/frontend-lib/components/](../../../apps/frontend-lib/components/)（Storybook）に委譲する。
- セマンティック HTML を第一とし、アクセシビリティ（ラベル・フォーカス・キーボード操作）を作り込む（[testing/02-e2e.md](../testing/02-e2e.md) のアクセシビリティ節）。

### 3.2 状態管理の責務分離

関心ごとに道具を分け、**サーバー状態をクライアントストアへ二重化しない**（[ecc-web/patterns.md](../../../.claude/rules/ecc-web/patterns.md)）。

| 関心 | 道具 | 方針 |
| --- | --- | --- |
| GraphQL サーバー状態 | **Apollo Client** | 内部 GraphQL（`api`）の取得・キャッシュ・正規化の主役 |
| 非 GraphQL のキャッシュ・再取得制御 | **React Query** | Apollo 管轄外（外部リソース等）のキャッシュ/再取得を補完 |
| グローバルなクライアント状態 | **Jotai** | UI 状態・横断フラグなど。サーバー状態は持たせない |
| URL 状態 | search params / route segments | フィルタ・並び順・ページング・アクティブタブ・検索語は URL に持たせ共有可能にする |
| フォーム状態 | **React Hook Form** + **Zod** | 入力状態と境界検証。検証スキーマは features/ の業務値に整合させる |

- 楽観的更新は「スナップショット→適用→失敗時ロールバック＋可視のエラー提示」を守る。一覧/検索は親子のリクエスト待ち（ウォーターフォール）を避け、独立データは並列取得する（[ecc-web/patterns.md](../../../.claude/rules/ecc-web/patterns.md)）。

### 3.3 スタイリング

- **Tailwind CSS** をユーティリティの主軸とし、デザイントークン（色・タイポ・余白・モーション）は CSS カスタムプロパティで定義する（[ecc-web/coding-style.md](../../../.claude/rules/ecc-web/coding-style.md)）。
- アニメーションはコンポジタフレンドリーなプロパティ（`transform`/`opacity` 等）に限定し、レイアウト連動プロパティのアニメーションを避ける。
- 素の CSS（トークン/global）も用いるが、**CSS 専用 Linter（Stylelint）は採用しない**。整形は Prettier（`prettier-plugin-tailwindcss` でクラス整列）、規約は本ガイドと ESLint（`jsx-a11y` 等）で担保する（決定の詳細は [02-lint-format-commit.md](./02-lint-format-commit.md) §3）。

## 4. 共有コードと型

- GraphQL スキーマと TypeScript 型の整合は **GraphQL Code Generator** で自動化し、生成物は「単一の真実から導出される成果物」として扱う（[api/01-graphql-internal.md](../api/01-graphql-internal.md) §7）。
- 業務の定数（文字数上限・件数・しきい値）はコード内でマジックナンバー化せず名前付き定数に束ねる。値の**正本は features/** であり、変更は features/ を更新してからコードへ反映する（[features/README.md](../../service/features/README.md)）。
- 共有するドメイン型・ユーティリティ（正規化・カーソルエンコード等）は重複実装を避け、ワークスペースの共有箇所に置く（DRY、[00-overview.md](./00-overview.md) §2）。

## 5. 関連ドキュメント

- コーディング原則: [00-overview.md](./00-overview.md)
- 静的解析・整形・コミット規約: [02-lint-format-commit.md](./02-lint-format-commit.md)
- API 設計規約（GraphQL/REST・認可・DataLoader・エラー写像）: [docs/GUIDES/api/](../api/)
- データモデル・命名規約: [docs/GUIDES/db/](../db/)
- アプリ構成・経路・レート制限層: [docs/GUIDES/infra/](../infra/)
- フロント実装パターン・状態管理: [ecc-web/patterns.md](../../../.claude/rules/ecc-web/patterns.md)
- 横断ビジネスルール: [00-common-rules.md](../../service/features/00-common-rules.md)
