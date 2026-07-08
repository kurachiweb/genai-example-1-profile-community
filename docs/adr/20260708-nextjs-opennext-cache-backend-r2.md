# ADR: Next.js（client/admin）OpenNext の ISR/Data Cache バックエンドを R2 に変更

- **ステータス**: 承認済み（Accepted）
- **日付**: 2026-07-08
- **対象**: `apps/client`・`apps/admin` の OpenNext ISR/Data Cache バックエンド。[20260604-nextjs-workers-opennext.md](./20260604-nextjs-workers-opennext.md) の一部を更新（本 ADR が優先する）

## 文脈

[20260604-nextjs-workers-opennext.md](./20260604-nextjs-workers-opennext.md) は「ISR/Data Cache のキャッシュバックエンドは Workers KV とし、既存の KV 採用と統合する」と決定していた。

Unit 6（`apps/client`・`apps/admin` の OpenNext 実装）着手にあたり `@opennextjs/cloudflare`（時点の最新版 `1.20.1`）を実際に導入し、パッケージ同梱の公式テンプレート（`node_modules/@opennextjs/cloudflare/templates/{wrangler.jsonc,open-next.config.ts}`）を確認したところ、**現在の公式デフォルト構成は KV ではなく R2（バケット）を ISR/Data Cache のバックエンドとして使う**ようになっていた（`R2IncrementalCache`・`WORKER_SELF_REFERENCE` サービスバインディングを含む構成）。KV バックエンドの実装（`KVIncrementalCache`・`KVNextModeTagCache`）はパッケージ内に現存し利用可能だが、もはや公式テンプレートの既定ではない。

旧 ADR 策定時点（2026-06-04）から `@opennextjs/cloudflare` の推奨構成が変わったため、本 ADR で決定を更新する。

## 検討した選択肢

### 選択肢 A: 現行の公式デフォルトに合わせ R2 に切り替える（採用）

- **Pros**: `@opennextjs/cloudflare` の**現行公式テンプレートに追従**でき、今後のアップデート・ドキュメント・不具合修正の恩恵を受けやすい。R2 は KV と異なり**結果整合の遅延（最大60秒）がない**ため、ISR 再検証の反映がより速く正確。本サービスは既に R2 をアイコン原本ストレージ・Terraform state バックエンドとして採用済みであり、ストレージ系統の増加は同種(R2)に留まる。
- **Cons**: 旧 ADR の記述と食い違うため本 ADR での更新が必要（本ドキュメントで対応）。client/admin 用に新規 R2 バケットを追加する（Terraform 管理）。

### 選択肢 B: 旧 ADR 通り KV を使い続ける（不採用）

- **Pros**: 旧 ADR の記述・既存 KV 採用方針との一貫性を保てる。ADR の変更が不要。
- **Cons**: **もはやツールの公式デフォルトではない**構成を選ぶことになり、将来の `@opennextjs/cloudflare` アップデートで非推奨・非対応になるリスクを負う。KV の結果整合(最大60秒遅延)は ISR の実利用上ほぼ問題にならない差だが、公式デフォルトから外れる合理的な理由が乏しい。

## 決定

**選択肢 A を採用する。`apps/client`・`apps/admin` の OpenNext ISR/Data Cache バックエンドは R2 とする。**

- `open-next.config.ts` は `@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache` を使用する(公式テンプレート標準)。
- `wrangler.jsonc` に `r2_buckets`(`NEXT_INC_CACHE_R2_BUCKET` バインディング)と、ISR の内部再検証 fetch に必要な自己参照サービスバインディング(`WORKER_SELF_REFERENCE`)を設定する。
- R2 バケットは client/admin で分離し(`genai-example-1-client-cache-${workspace}` / `genai-example-1-admin-cache-${workspace}`)、Terraform(`apps/infra/r2.tf`)で管理する。
- タグキャッシュ(`revalidatePath`/`revalidateTag` の整合管理)は `@opennextjs/cloudflare` の既定(D1 不使用時はメモリ内蔵の既定実装)に委ね、追加のバインディングは設けない(将来、複数リビジョン間の整合性要件が顕在化した場合に D1/KV ベースのタグキャッシュ導入を再検討する)。
- Cloudflare Images を使った画像最適化(`images.binding: IMAGES`)は本 Unit の対象外とし(既存の `next.config.ts` の `images.remotePatterns` 経由の配信を維持)、必要になった時点で別途検討する。

## 結果・影響

### 正の影響

- `@opennextjs/cloudflare` の公式デフォルトに追従し、保守性・追従性が向上する。
- ISR 再検証の反映が KV より速く、結果整合の遅延を考慮する必要がなくなる。
- 既存の R2 採用(アイコンストレージ・Terraform state)と技術系統が揃う。

### 負の影響・トレードオフ

- 旧 ADR([20260604-nextjs-workers-opennext.md](./20260604-nextjs-workers-opennext.md))の記述と本 ADR に差分が生じる(本 ADRが優先する記録として残す)。
- client/admin 用に新規 R2 バケットが 2 つ増える(Terraform 管理・低コスト)。

## 将来の見直しトリガ

- `@opennextjs/cloudflare` の公式デフォルトが再度変わった場合。
- タグキャッシュの整合性要件が顕在化し、D1/KV ベースの `tagCache` 実装が必要になった場合。
- Cloudflare Images を用いた画像最適化(`images` バインディング)を採用する場合。

## 関連

- 更新対象: [20260604-nextjs-workers-opennext.md](./20260604-nextjs-workers-opennext.md)
- インフラ: [00-overview.md](../GUIDES/infra/00-overview.md) §2/§3/§8
- 技術選定・デプロイ方針の正本: [CLAUDE.md](../../CLAUDE.md)
