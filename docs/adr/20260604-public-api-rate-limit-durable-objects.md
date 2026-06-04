# ADR: 公開API のキー単位レート制限カウンタに Durable Objects を採用

- **ステータス**: 承認済み（Accepted）
- **日付**: 2026-06-04
- **対象**: 公開API（`apps/public-api`）の**キー単位レート制限カウンタ**の保存先 / [00-overview.md](../GUIDES/infra/00-overview.md) §3・§8、[01-network-architecture.md](../GUIDES/infra/01-network-architecture.md) §3、[db/01-data-model.md](../GUIDES/db/01-data-model.md) §7

## 文脈

公開API は API キー単位で **60 リクエスト / 分** のレート制限を行う（[05-public-api.md](../service/features/05-public-api.md) `BR-API-008`、[00-common-rules.md](../service/features/00-common-rules.md) `BR-COMMON-010`）。レート制限はエッジ（Cloudflare WAF Rate Limiting Rules・全キー共通値・Terraform 管理）とアプリ層（`@nestjs/throttler`・キー単位）の**二層**で多層防御する（[01-network-architecture.md](../GUIDES/infra/01-network-architecture.md) §3）。

このうち**アプリ層のキー単位カウンタの保存先**が「オープン事項」として未決のまま残っていた（旧 [00-overview.md](../GUIDES/infra/00-overview.md) §8: 「KV での近似カウントで十分か、DO による厳密カウントが必要かは負荷特性を見て決定する」）。ドキュメント上は「精密カウンタ・任意」「必要に応じ DO」「KV / DO 併記」と曖昧な表現が複数箇所に残っていた。`apps/` 配下は未実装で、保存先はコード・ドキュメントのどこにも確定記載がない状態であった。

決定にあたって踏まえた要件・前提は次の通り。

### レート制限の要件

- 公開API は応答に `RateLimit-Limit` / `RateLimit-Remaining` / `RateLimit-Reset` を付与し、利用者がキー単位の残量を把握できる必要がある（`BR-API-008`、`AC-API-013`）。
- 直近 1 分で 60 リクエストを使い切ったキーの 61 回目は確実に `429 RATE_LIMITED` + `Retry-After` を返し、リセット後は再び成功する（`AC-API-014`）。残量・超過判定は**キー単位で厳密**であることが期待される。
- しきい値超過時は処理せず `429` を返す（`BR-API-009`）。レート制限はキー単位で独立してカウントする。

### Cloudflare ストレージの特性

- **KV** は結果整合（読み取りは最大数十秒のキャッシュ）であり、**同一キーへの高頻度書き込みに弱い**。60 req/分/キー は定常で約 1 write/sec/キーだが、バースト時はカウントがずれ、近似値となる。
- **Durable Objects（DO）** は ID 単位で単一インスタンス・単一スレッド・強整合であり、キーごとの**正確な逐次カウント**に適する。コストは DO のリクエスト数＋実行時間に比例し、同一キーのリクエストは 1 インスタンスにシリアライズされる。
- セッション・ワンタイムトークン・短 TTL キャッシュ・公開API 以外のアプリ層レート制限（認証系・通報系）は既に **KV** で確定済み（[00-overview.md](../GUIDES/infra/00-overview.md) §3.1、[db/01-data-model.md](../GUIDES/db/01-data-model.md) §7）。一般閲覧・検索（未認証）は**エッジ WAF のみ**で制限し、アプリ層カウンタ（KV）を持たない。
- 規模は個人開発アプリで**低コスト・低運用負荷**を重視する。DO の採用範囲は厳密性が事業価値に直結する箇所に限定したい。

### 実装前提

- `@nestjs/throttler` は `ThrottlerStorage` インターフェースで保存先を差し替えられる。公開API の Throttler には **DO バックエンドの `ThrottlerStorage` 実装**を、その他アプリには **KV バックエンドの実装**を用いることで、アプリごとに保存先を棲み分けできる。

## 検討した選択肢

### 選択肢 A: KV のみで近似カウント + エッジ WAF を安全網とする（不採用）

- **Pros**: 保存先を KV に一本化でき、最小コスト・最小複雑性。DO のコード・課金・運用がゼロ。個人開発の低コスト方針・YAGNI に最も素直。
- **Cons**: KV は結果整合・高頻度書き込みに弱く、キー単位の残量（`RateLimit-Remaining`）が近似値となり、バースト時に 60 をわずかに超過しうる。`AC-API-013`/`AC-API-014` の**キー単位の厳密性**をアプリ層単独では満たせない（エッジ WAF は全キー共通値の安全網であり、キー単位の正確な残量提示はできない）。

### 選択肢 B: 公開API のキー単位カウンタのみ Durable Objects で厳密化（採用）

- **Pros**: キー単位の正確な逐次カウントが可能で、`RateLimit-*` ヘッダの残量と `429` 判定を厳密に満たせる。現行ドキュメントの記述（DO ＝公開API キー単位の精密カウンタ、`PUBAPI --> DO`）に最も忠実。DO の採用を**公開API のキー単位カウンタ 1 点に限定**するため、コスト増・運用負荷を局所化できる。
- **Cons**: DO クラス（`ThrottlerStorage` 実装）の実装・課金（リクエスト数＋実行時間）・運用が追加される。同一キーのリクエストが 1 DO インスタンスにシリアライズされる分の僅かなレイテンシが生じる。

### 選択肢 C: KV 既定 + `ThrottlerStorage` 抽象で DO を将来差し替え（不採用）

- **Pros**: v1 は KV 実装で出荷し、負荷特性が顕在化したら DO 実装へ無改修で差し替え可能。決定を遅延しつつ移行容易性を確保できる。
- **Cons**: 「採用範囲」を**確定しきれず**、オープン事項が条件付きで残り続ける。`AC-API-013`/`AC-API-014` のキー単位の厳密性を v1 時点では満たせない。今回の目的（オープン事項の確定）に反する。

### 選択肢 D: Cloudflare Workers ネイティブ Rate Limiting binding（不採用）

- **Pros**: DO を自作せずにキー単位の厳密寄り制限が得られ、DO よりコード・運用が軽い。
- **Cons**: 固定ウィンドウ（10s/60s 等）・namespace 上限などの制約があり、`@nestjs/throttler` との統合が未検証。アプリ層の抽象（`ThrottlerStorage`）に乗せにくく、二層防御の整合確認に追加調査が必要。現時点では前提が固まっていない。

## 決定

**選択肢 B を採用する。公開API（`apps/public-api`）のキー単位レート制限カウンタは Durable Objects で厳密にカウントする。**

- 公開API のアプリ層レート制限（`@nestjs/throttler`）のカウンタを **DO** に保存する。キー設計は `rl:apikey:<keyId>:<window>`（API キーごとに 1 DO インスタンス）。
- **その他のアプリ層レート制限カウンタ**（認証系・通報系の各スコープ）と、**セッション・ワンタイムトークン・短 TTL キャッシュ**は引き続き **KV** に保存する（`rl:<scope>:<id>:<window>`）。
- **一般閲覧・検索（未認証）**はエッジ WAF Rate Limiting Rules のみで制限し、アプリ層カウンタ（KV）を持たない。
- **エッジ WAF Rate Limiting Rules**（全キー共通値・Terraform 管理）は二層目の安全網として維持する。アプリ層（DO）とエッジ（WAF）のしきい値は整合させて運用する（`BR-ADMIN-008`）。
- 実装は `@nestjs/throttler` の `ThrottlerStorage` を DO バックエンドで実装して差し替える。ローカル開発では DO の代替（メモリ／SQLite ベースのスタブ等）で同等のキー単位カウントを再現する。
- 実コード（DO クラス・`wrangler.toml` の DO バインディング・`ThrottlerStorage` 実装）は `apps/public-api` 実装時に整備する。本 ADR は**実装に先行する設計記録**である。

## 結果・影響

### 正の影響

- 公開API のレート制限がキー単位で厳密になり、`RateLimit-*` ヘッダの残量提示（`AC-API-013`）と 60→61 回目の `429`（`AC-API-014`）を正確に満たせる。
- DO の採用が**公開API のキー単位カウンタ 1 点に限定**され、その他のデータは KV のまま。ストレージ系統の追加が最小限に収まる。
- 「オープン事項」が解消され、設計ドキュメントの曖昧表現（「任意」「必要に応じ DO」「KV / DO 併記」）が確定記述に統一される。

### 負の影響・トレードオフ

- DO クラス（`ThrottlerStorage` 実装）の追加実装・課金（リクエスト数＋実行時間）・運用が発生する。
- 同一キーのリクエストが 1 DO インスタンスにシリアライズされ、僅かなレイテンシが生じる（キー単位のレート制限としては許容範囲）。
- アプリ層の保存先がアプリごとに異なる（公開API ＝ DO、その他 ＝ KV）ため、`ThrottlerStorage` 実装を 2 系統維持する必要がある。

## 将来の見直しトリガ

次のいずれかが顕在化した場合、本決定を再評価する。

- DO の**コスト・レイテンシ**が運用上の問題になった場合（KV 近似カウント ＋ エッジ WAF への回帰を検討）。
- 公開API **以外**のスコープでもキー単位の厳密なレート制限が必要になった場合（DO 採用範囲の拡大を検討）。
- Cloudflare の **ネイティブ Rate Limiting binding** が `@nestjs/throttler` と統合可能になり、DO 自作より優位になった場合。

## 関連

- インフラ: [00-overview.md](../GUIDES/infra/00-overview.md) §3/§8 / [01-network-architecture.md](../GUIDES/infra/01-network-architecture.md) §3 / [db/01-data-model.md](../GUIDES/db/01-data-model.md) §7
- ビジネスルール: `BR-API-008`/`BR-API-009`（公開API レート制限・`AC-API-013`/`AC-API-014`）、`BR-COMMON-010`（レート制限の階層）、`BR-ADMIN-008`（しきい値変更）
- 技術選定・デプロイ方針の正本: [CLAUDE.md](../../CLAUDE.md)
- 先例（Cloudflare リソース選定・実装方式の抽象化）: [20260604-nextjs-workers-opennext.md](./20260604-nextjs-workers-opennext.md) / [20260603-nsfw-moderation-rekognition.md](./20260603-nsfw-moderation-rekognition.md) / [20260603-profile-search-fts5.md](./20260603-profile-search-fts5.md)
