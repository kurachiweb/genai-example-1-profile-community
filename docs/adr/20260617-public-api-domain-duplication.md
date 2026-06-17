# ADR: 公開 API のドメイン層は apps/public-api 内に複製する

- **ステータス**: 承認済み（Accepted）
- **日付**: 2026-06-17
- **対象**: 公開 REST API（`apps/public-api`）と内部 GraphQL API（`apps/api`）が共有するドメイン層（実効公開ゲート・入力検証/正規化・カーソル・エラー語彙・ハンドル/表示名・上限値）のコード共有方式 / [api/00-overview.md](../GUIDES/api/00-overview.md) §1、[coding/04-nestjs.md](../GUIDES/coding/04-nestjs.md) §1、`pnpm-workspace.yaml`

## 文脈

公開 REST API（`apps/public-api`）は、内部 GraphQL API（`apps/api`）と**同一のビジネスルール**でプロフィールを検証し、**同一の実効公開ゲート（`BR-COMMON-007`）**で他者分を秘匿し、**同一のエラー語彙（`BR-API-011`）**でエラーを写像する必要がある（[api/00-overview.md](../GUIDES/api/00-overview.md) §2.1・§2.3・§2.4）。これらは `apps/api` のドメイン層（`src/domain/`）とユースケース層に既に実装済みである。

`apps/public-api` 実装にあたり、この共通ドメインを**どう持つか**を確定する必要があった。前提:

- `pnpm-workspace.yaml` のパッケージ対象は `apps/*` のみ。共有ライブラリ用の `packages/` 階層は存在しない。フロントエンド共通は `apps/frontend-lib` をエイリアスで参照する別系統（CLAUDE.md）。
- `apps/api` は NestJS アプリであり、ライブラリとしての `exports` マップを公開していない。他アプリから安定して import できる公開境界を持たない。
- 設計方針は公開 API と内部 API を**別アプリ・別 Worker・別認証・別境界**として独立させること（[api/00-overview.md](../GUIDES/api/00-overview.md) §1、[infra/01-network-architecture.md](../GUIDES/infra/01-network-architecture.md) §1）。
- CLAUDE.md は「車輪の再発明を許容し、簡易なユーティリティ関数のために npm パッケージをインストールしない」とし、限定的な重複を許容する姿勢を示す。
- 共通対象のドメインは「安定したビジネスルール」であり、変更頻度は低い。変更時の正本は常に `docs/service/features/`（SSoT）。

## 検討した選択肢

### 選択肢 A: `apps/public-api` 内にドメイン/ユースケース層を複製する（採用）

- **Pros**: 各アプリが完全に独立し、別 Worker として個別にデプロイ・ビルドできる（設計方針 §1 に最も整合）。`pnpm-workspace`（`apps/*` のみ）の現構成を変えない。`apps/api` を一切変更しないため既存ユニットへの回帰リスクがゼロ。公開 API は内部 API のミューテーション群（`changeHandle`/`updateVisibility` 等）を必要とせず、必要な部分集合だけを持てる。
- **Cons**: ドメイン層が 2 箇所に重複し DRY に反する。ビジネスルール変更時は両アプリへ水平展開が必要（features/ が正本である点でリスクは限定）。

### 選択肢 B: `@app/api` を workspace 依存として参照する（不採用）

- **Pros**: 単一の出所。重複ゼロ。
- **Cons**: `apps/api` は公開 `exports` を持たないため深いパス（`@app/api/src/domain/...`）参照になり、内部構造に結合する。公開 API のビルド・デプロイが内部 API のソースレイアウトに依存し、「別アプリ・別 Worker・別境界」の独立性が崩れる。Workers への個別バンドルも複雑化する。

### 選択肢 C: 共有ワークスペースパッケージ（`packages/domain` 等）へ抽出する（不採用・将来トリガあり）

- **Pros**: 最も DRY で、共有境界が明示される。長期的には最も健全。
- **Cons**: `pnpm-workspace.yaml` への `packages/*` 追加、`apps/api` の依存差し替えという**既存ユニットを巻き込む大きめのリファクタ**になり、今回の「`apps/public-api` を完成させる」スコープを超える。共有対象が 2 アプリ・1 ドメインに留まる現段階では過剰（YAGNI）。

## 決定

**選択肢 A を採用する。`apps/public-api` 内にドメイン層（および公開 API 用に再構成したユースケース層）を複製する。**

- 複製対象は `apps/api/src/domain/` の純粋ロジック（`errors`・`user-status`・`effective-public`・`text`・`grapheme`・`handle`・`display-name`・`cursor`・`limits`・`sns-link`・`profile-fields`）。公開 API 固有の `api-key`（スコープ・キー状態）を新規追加する。
- ユースケース層は公開 API のエンドポイント（本人フル CRUD・他者公開 Read・一覧）に必要な操作のみを実装する。
- ビジネスルールの**正本は常に `docs/service/features/`（SSoT）**。複製コードは正本の写しであり、値・規則の変更時は features/ を更新したうえで両アプリへ水平展開する（CLAUDE.md「影響範囲が広いものと考えて水平展開」）。
- 複製コードの同期性はテストで担保する（両アプリが同一の `AC-*` を満たすことを各々の単体・統合テストで検証）。

## 結果・影響

### 正の影響

- `apps/public-api` が独立してビルド・デプロイ可能になり、別 Worker 方針と一致する。
- `apps/api` を変更しないため既存ユニット（`api-internal-profile`）への回帰リスクがない。
- 公開 API は必要なユースケースの部分集合のみを保持でき、内部 API の GraphQL 固有機構（DataLoader 等）を持ち込まない。

### 負の影響・トレードオフ

- ドメイン層が重複し、ビジネスルール変更時に両アプリへの反映が必要（features/ が正本のため、変更箇所は明確）。
- 重複コードのドリフト（片側だけ変更してしまう）リスク。各アプリのテストと水平展開ルールで緩和する。

## 将来の見直しトリガ

- 共有ドメインに依存するアプリが **3 つ以上**になった場合、または重複ドリフトが実害を生んだ場合は、選択肢 C（`packages/domain` 抽出）へ移行する。
- `apps/api` がライブラリとしての安定した公開 `exports` を持つに至った場合は、選択肢 B も再評価する。

## 関連

- API 全体方針（2 面の分離・別アプリ/別 Worker）: [api/00-overview.md](../GUIDES/api/00-overview.md) §1
- NestJS 層対応: [coding/04-nestjs.md](../GUIDES/coding/04-nestjs.md) §1
- 公開 API 業務仕様の正本: [features/05-public-api.md](../service/features/05-public-api.md)
- レート制限・キースコープの先行 ADR: [20260604-public-api-rate-limit-durable-objects.md](./20260604-public-api-rate-limit-durable-objects.md) / [20260605-public-api-key-scopes.md](./20260605-public-api-key-scopes.md)
- 技術選定・水平展開方針の正本: [CLAUDE.md](../../CLAUDE.md)
