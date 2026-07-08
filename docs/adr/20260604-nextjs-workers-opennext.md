# ADR: Next.js（client/admin）の Workers 配信アダプタ — `@opennextjs/cloudflare`（OpenNext）を採用

- **ステータス**: 承認済み（Accepted。ただし ISR/Data Cache のバックエンドに関する部分は [20260708-nextjs-opennext-cache-backend-r2.md](./20260708-nextjs-opennext-cache-backend-r2.md) により KV → R2 へ更新済み）
- **日付**: 2026-06-04
- **対象**: `apps/client`・`apps/admin`（Next.js, App Router）の Cloudflare Workers へのデプロイ方式 / `docs/GUIDES/infra/00-overview.md` §2・§8

## 文脈

`apps/client`（利用者・閲覧者向け Web）と `apps/admin`（管理者コンソール）は Next.js（App Router）で実装し、**Cloudflare Workers** 上で動作させる方針である（[00-overview.md](../GUIDES/infra/00-overview.md) §2、[CLAUDE.md](../../CLAUDE.md) 技術選定・デプロイ方針）。
当初、Next.js を Workers で配信する**具体的な公式アダプタ**が「オープン事項」として未決のまま残っていた（旧 `00-overview.md` §8 の注記）。`apps/` 配下は未実装で、アダプタ名はコード・ドキュメントのどこにも記載がない状態であった。

決定にあたって踏まえた要件・前提は次の通り。

### 配信要件

- client/admin は **HTTPS-Only Cookie によるユーザー認証**・**SSR**・**公開ゲート等のサーバー側処理**が必須（[00-common-rules.md](../service/features/00-common-rules.md) `BR-COMMON-001`/`002`、[01-network-architecture.md](../GUIDES/infra/01-network-architecture.md)）。静的書き出しのみでは要件を満たせない。
- デプロイ先は **Cloudflare Workers**（Pages ではない）。client と admin は別アプリ・別ドメイン・別 Worker（[00-overview.md](../GUIDES/infra/00-overview.md) §2）。
- ビルド/デプロイは **Cloudflare Workers Builds**（main への push で dev へ自動、[02-deployment.md](../GUIDES/infra/02-deployment.md) §2）。

### 技術前提

- 既に **Cloudflare KV** を採用済み（セッション・トークン・レート制限カウンタ・短 TTL キャッシュ。[00-overview.md](../GUIDES/infra/00-overview.md) §3.1）。Next.js の ISR/Data Cache キャッシュバックエンドと統合できると親和性が高い。
- 規模は個人開発アプリ。**低コスト・低運用負荷**を重視し、**Cloudflare 主軸・ベンダ最小化**の方針に沿う。
- 2024 年後半以降、Cloudflare は Next.js → Workers のデプロイ手段として **`@opennextjs/cloudflare`** を公式推奨としており、旧来の `@cloudflare/next-on-pages`（Pages 向け）に置き換わっている。

## 検討した選択肢

### 選択肢 A: `@opennextjs/cloudflare`（OpenNext Cloudflare アダプタ）（採用）

- **Pros**: Cloudflare の**現行公式推奨**。Next.js の **Node.js ランタイム**で動作し、SSR / ISR / Route Handlers / Middleware を**フルサポート**する。ISR/Data Cache のバックエンドに **Workers KV** を利用でき、本サービスの既存 KV 採用と統合しやすい。`npm create cloudflare@latest -- --framework=next --platform=workers` でスキャフォールドでき、Workers Builds でビルド/デプロイ可能。「Workers にデプロイ」「Cloudflare 公式アダプタを用いる」という方針に最も素直に合致する。OpenNext の e2e テストスイートにより新しい Next.js 機能への追従が速い。
- **Cons**: Workers の **`nodejs_compat` フラグ**有効化と **compatibility date `2024-09-23` 以降**が必要。現状 Next.js の **Edge ランタイムは未対応**で、Node ランタイム前提（`export const runtime = 'edge'` を使わない）。OpenNext のビルド変換工程が増える。

### 選択肢 B: `@cloudflare/next-on-pages`（不採用）

- **Pros**: 従来から実績があり、Cloudflare Pages 向けに枯れている。
- **Cons**: **Cloudflare Pages** 向けであり、全動的ルートで **Edge ランタイム必須**（`export const runtime = 'edge'`）。Node.js API が使えず、サーバー処理の制約が大きい。実質メンテナンスモードで、新規は OpenNext が推奨。デプロイ先が Pages となり、本プロジェクトの **Workers 方針と外れる**。

### 選択肢 C: Static Export（`output: 'export'`）+ Workers Static Assets（不採用）

- **Pros**: 静的配信のみで構成が単純・低コスト。
- **Cons**: SSR・サーバーコンポーネントのサーバー実行・**サーバー側 Cookie セッション**・公開ゲート等が**実行不可**。本サービスの認証/SSR 要件に**単独では不適**。部分的な静的化の補助としてのみ意味がある。

### 選択肢 D: Cloudflare Pages にデプロイ（不採用）

- **Pros**: Next.js のホスティング先として一般的だった。
- **Cons**: Cloudflare は **Pages を Workers へ統合**する方向で、新規は **Workers + OpenNext** を推奨している。本プロジェクトの Workers 方針とも外れる。

## 決定

**選択肢 A を採用する。Next.js（client/admin）の Workers 配信アダプタは `@opennextjs/cloudflare`（OpenNext）とする。**

- client/admin の各 Worker を OpenNext アダプタでビルドし、**Cloudflare Workers** にデプロイする。
- Worker 設定で **`nodejs_compat` フラグを有効化**し、**compatibility date を `2024-09-23` 以降**に設定する。
- **Node ランタイム前提**で実装する（`export const runtime = 'edge'` は使用しない）。Edge ランタイムが必要になった場合は将来の見直しトリガとする。
- **ISR/Data Cache のキャッシュバックエンドは Workers KV** とし、既存の KV 採用（[00-overview.md](../GUIDES/infra/00-overview.md) §3.1）と統合する。
- ビルド/デプロイは **Cloudflare Workers Builds**（[02-deployment.md](../GUIDES/infra/02-deployment.md) §2）で OpenNext ビルドを実行する。
- 実コード（`wrangler.toml` / `open-next.config.ts` 等）は `apps/` 実装時に整備する。本 ADR は**実装に先行する設計記録**である。

## 結果・影響

### 正の影響

- フル機能の SSR / ISR / Route Handlers / Middleware が使え、HTTPS-Only Cookie 認証・公開ゲート等のサーバー側要件を満たせる。
- ISR/Data Cache を **既存 Workers KV** と統合でき、ストレージ系統を増やさない。
- Cloudflare 公式推奨であり、ドキュメント・サポート・新機能追従の面で安定する。

### 負の影響・トレードオフ

- **OpenNext のビルド変換工程**が追加され、ビルド構成がやや複雑になる。
- **Edge ランタイム非対応**（現状）。Node ランタイム前提の設計に統一する必要がある。
- `nodejs_compat` フラグ・compatibility date の**バージョン要件**を満たす必要がある（Worker 設定で担保）。

## 将来の見直しトリガ

次のいずれかが顕在化した場合、アダプタ構成を再評価する。

- Next.js の **Edge ランタイム**が必須となる要件が生じた場合（OpenNext の Edge 対応状況を確認のうえ判断）。
- ビルド時間・コールドスタート・**Worker バンドルサイズ**が運用上の問題になった場合。
- Cloudflare 側の推奨アダプタや Pages/Workers 統合方針が変わった場合。

## 関連

- インフラ: [00-overview.md](../GUIDES/infra/00-overview.md) §2/§3/§8 / [01-network-architecture.md](../GUIDES/infra/01-network-architecture.md) / [02-deployment.md](../GUIDES/infra/02-deployment.md) §2
- ビジネスルール: `BR-COMMON-001`/`002`（認証・client/admin 分離）
- 技術選定・デプロイ方針の正本: [CLAUDE.md](../../CLAUDE.md)
- 先例（実装方式の選択・抽象化）: [20260603-nsfw-moderation-rekognition.md](./20260603-nsfw-moderation-rekognition.md) / [20260603-profile-search-fts5.md](./20260603-profile-search-fts5.md)
