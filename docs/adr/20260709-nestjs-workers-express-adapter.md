# ADR: NestJS の Workers ランタイムアダプタ — Hono ではなく Cloudflare 公式 Express-on-Workers サポートを採用

- **ステータス**: 承認済み（Accepted）
- **日付**: 2026-07-09
- **対象**: `apps/api`・`apps/public-api`（NestJS）の Cloudflare Workers 実行方式 / `docs/GUIDES/coding/04-nestjs.md` §7・`docs/GUIDES/infra/00-overview.md` §2

## 文脈

`apps/api`・`apps/public-api` は NestJS（クリーンアーキテクチャ）で実装し、**Cloudflare Workers** 上で動作させる方針である（[CLAUDE.md](../../CLAUDE.md) 技術選定・デプロイ方針）。
当初、CLAUDE.md・`docs/GUIDES/coding/04-nestjs.md` §7 は **Hono アダプタ**を採用する前提で記述していた（NestJS 公式には Hono 用アダプタが存在しないため、`@h4ad/serverless-adapter` 等の OSS ブリッジ経由での採用を想定していた、実装に先行する設計記録の段階）。

Workers アダプタの実装(Unit 4)に着手した時点で、NestJS の実運用機能(Apollo Server による GraphQL、`class-validator`/`class-transformer` によるバリデーション、Guard/Interceptor/Filter、`@nestjs/throttler`)を Hono ブリッジ経由で動かす場合、以下の課題が実機検証で判明した。

- NestJS の型ベース DI（`design:paramtypes`、`emitDecoratorMetadata`）は Express アダプタ（`@nestjs/platform-express`）を前提に作り込まれた機能・エコシステム（Apollo Server 統合含む）が最も充実しており、Hono ブリッジ経由では実績・検証コストが不透明だった。
- 一方、Cloudflare は 2025 年に **Node.js 標準の `http.Server` をそのまま Workers 上で動かす公式サポート**（`cloudflare:node` モジュールの `httpServerHandler`）を提供しており、Express（`app.listen()`）を含む Node.js の HTTP サーバーをコード変更なしで Workers 上に載せられる。

## 検討した選択肢

### 選択肢 A: Hono アダプタ（`@h4ad/serverless-adapter` 等）（不採用）

- **Pros**: Hono 自体は Workers ネイティブで軽量・高速。エッジ環境全般への移植性が高い。
- **Cons**: NestJS 公式の Hono アダプタは存在せず、サードパーティのブリッジ層（`@h4ad/serverless-adapter` 等）に依存する。Apollo Server・class-validator・Guard/Interceptor/Filter など NestJS の主要機能がブリッジ経由でも同等に動作するかは実装しながらの検証が必要で、不具合時の切り分けコストが高い。

### 選択肢 B: Cloudflare 公式 Express-on-Workers サポート（採用）

- **Pros**: `@nestjs/platform-express`（NestJS の既定アダプタ）を**変更せずにそのまま**使える。ローカル開発（`main.ts`、Express）と Workers 本番（`worker.ts`、`httpServerHandler`）でアプリケーションコードを完全に共有でき、ランタイム差異は `worker.ts`（Frameworks & Drivers 層）に閉じ込められる（[01-architecture.md](../GUIDES/coding/01-architecture.md) §2.2）。Cloudflare 公式機能のため、esbuild バンドル時の互換性問題が生じても Cloudflare 側のサポート対象になる。
- **Cons**: `cloudflare:node` の `httpServerHandler` は比較的新しい機能で、`compatibility_date` が 2025-08-15 以降であることが必須。esbuild（wrangler のバンドラ）が `emitDecoratorMetadata` に対応していないため、NestJS の型ベース DI に必要なメタデータを生成できず、素の `src/*.ts` を直接バンドルさせると依存解決が壊れる（既知の esbuild の制約）。この対策として、事前に `pnpm build`（`nest build`、tsc 経由）で正しくメタデータ付与済みの JS を生成し、`worker.ts` からは `dist/` を動的 `import()` する構成が必要になった（`apps/api/src/worker.ts` 参照）。

### 選択肢 C: Fastify アダプタ + `@fastify/*` の Workers 対応（不採用）

- **Pros**: NestJS は Fastify アダプタも公式サポートしており、Express より高速という一般的評価がある。
- **Cons**: Fastify 自体が Cloudflare Workers 上での動作を公式にサポートしておらず、選択肢 A と同様のブリッジ層が必要になる。移行のメリットに対し検証コストが見合わない。

## 決定

**選択肢 B を採用する。NestJS（`apps/api`・`apps/public-api`）は `@nestjs/platform-express` のまま、Cloudflare 公式の Express-on-Workers サポート（`cloudflare:node` の `httpServerHandler`）で Workers ランタイム上に動かす。**

- Worker エントリポイントは `apps/api/src/worker.ts`・`apps/public-api/src/worker.ts`。ローカル開発用の `main.ts`（Express、`nest start`）とは別に維持し、アプリケーションコード（`AppModule` 以下）自体は完全に共有する。
- `wrangler.jsonc` の `compatibility_date` は `2025-09-23`（`httpServerHandler` の要求日付以降）、`compatibility_flags` に `nodejs_compat` を設定する。
- esbuild の `emitDecoratorMetadata` 非対応を回避するため、`worker.ts` は `pnpm build`（`nest build`）が生成した `dist/*.js` を動的 `import()` で参照する。`src/*.ts` を直接 import させない。
- GraphQLModule 初期化時の同期的な `crypto.randomUUID()` 呼び出し等、Workers の「グローバルスコープでの非同期 I/O 禁止」制約に抵触する処理は、最初のリクエストが来るまで動的 `import()` で遅延させる（`worker.ts` 内コメント参照）。
- 同一パターンを `apps/public-api` にも適用する。

## 結果・影響

### 正の影響

- ローカル/Workers で NestJS アプリケーションコードを完全に共有でき、Hono ブリッジのような追加の互換性検証層を持たない。
- `@nestjs/platform-express` は NestJS のデフォルトかつ最も実績のあるアダプタであり、Apollo Server・Guard/Interceptor/Filter・class-validator との組み合わせで新たな不具合を作り込むリスクが小さい。

### 負の影響・トレードオフ

- `dist/` を直接 import する構成のため、Worker のビルド手順が「`nest build` → `wrangler deploy`」の 2 段階になる（`package.json` の `deploy:worker` スクリプトで一体化）。
- `httpServerHandler` は比較的新しい Cloudflare 機能であり、将来の破壊的変更・非推奨化のリスクは Hono 等の枯れたエッジネイティブフレームワークより相対的に高い可能性がある。

## 将来の見直しトリガ

- `cloudflare:node` の `httpServerHandler` が非推奨化・大幅な仕様変更を受けた場合。
- コールドスタート時間・Worker バンドルサイズが運用上の問題になり、より軽量なランタイム（Hono 等）への移行が必要になった場合。
- NestJS が公式に Workers/エッジランタイム向けアダプタを提供した場合（再評価の好機）。

## 関連

- コーディング規約: [coding/04-nestjs.md](../GUIDES/coding/04-nestjs.md) §7
- インフラ概要: [infra/00-overview.md](../GUIDES/infra/00-overview.md) §2
- 実装: `apps/api/src/worker.ts`・`apps/public-api/src/worker.ts`
- 先例（実装方式の選択・実機検証に基づく決定）: [20260604-nextjs-workers-opennext.md](./20260604-nextjs-workers-opennext.md) / [20260710-ses-mail-aws4fetch.md](./20260710-ses-mail-aws4fetch.md)
- 技術選定・デプロイ方針の正本: [CLAUDE.md](../../CLAUDE.md)
