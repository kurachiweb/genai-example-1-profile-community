# ADR: NSFW 判定（BR-SAFE-001）の実装方式 — AWS Rekognition Content Moderation を採用

- **ステータス**: 承認済み（Accepted）
- **日付**: 2026-06-03
- **対象**: `BR-SAFE-001`（アイコンアップロード時の自動 NSFW 判定） / `docs/GUIDES/infra/01-network-architecture.md` §2.2

## 文脈

利用者は画面操作または公開 API でアイコン画像をアップロードでき、アップロード時に**自動で NSFW（不適切）判定**を行い、不適切と判定された画像は保存せず拒否する（[06-trust-and-safety.md](../service/features/06-trust-and-safety.md) `BR-SAFE-001`、[02-profile.md](../service/features/02-profile.md) `BR-PROF-001`、[05-public-api.md](../service/features/05-public-api.md) `BR-API-006`）。
当初、判定エンジンに **Cloudflare Workers AI 等のいずれを用いるか**が「オープン事項」として未決のまま残っていた（旧 `00-overview.md` §8・`06-trust-and-safety.md` §7 の注記）。

決定にあたって踏まえた要件・前提は次の通り。

### 判定要件（`BR-SAFE-001`）

- 判定は**分類カテゴリ（例: 露骨な性的表現・暴力・グロテスク等）に対するスコア**で行い、**しきい値を超えたら拒否**する。しきい値は**設定で管理**する。
- アップロードの**同期処理**として実行し、合格時のみ R2（原本）→ Cloudflare Images（512px 正規化・配信）へ保存、超過時は `422` を返し既存アイコンは変更しない（[01-network-architecture.md](../GUIDES/infra/01-network-architecture.md) §2.2）。
- 判定結果（合否・スコア・カテゴリ）を `nsfw_checks` に記録する（個人特定情報は最小化、[01-data-model.md](../GUIDES/db/01-data-model.md) §5.6）。
- 拒否時、利用者には詳細な判定理由を晒さず「画像を保存できなかった」旨を提示する（回避テクニックの誘発回避）。
- 自動判定をすり抜けた画像は通報・管理者モデレーションで事後対応する（`BR-SAFE-002`）。

### 技術前提

- 実行環境は **Cloudflare Workers**（`api` / `public-api`）。判定は同期で行うためレイテンシと実行時間制限に配慮する。
- 規模は個人開発アプリ。**低コスト・低運用負荷**を重視。
- 既存の外部ベンダは **AWS（Amazon SES）** のみで、AWS 認証情報の管理機構（Wrangler Secrets / GitHub Actions Secrets）は既に存在する。
- ORM は MikroORM、バックエンドは NestJS（オニオンアーキテクチャ）。

## 検討した選択肢

### 選択肢 A: Cloudflare Workers AI

- **Pros**: 画像が Cloudflare 外へ出ない（ゼロ egress）。単一ベンダで運用が単純。Workers AI の無料枠＋ニューロン課金で実質ほぼ無料。`00-overview.md` の既定候補に合致。
- **Cons**: 較正済みの専用 NSFW 分類器がカタログに存在する保証がなく、現実的には **Vision LLM（Llama 3.2 Vision 等）を安全性ジャッジ**として使う形になる。LLM 方式はカテゴリスコアの意味づけが緩く、JSON 出力の頑健化が必要で、レイテンシ/コストもやや高い。`BR-SAFE-001` の「カテゴリ×スコア×しきい値」への適合が間接的。

### 選択肢 B: AWS Rekognition Content Moderation（採用）

- **Pros**: `DetectModerationLabels` が**階層化された較正済みカテゴリ別 `Confidence`（0–100）** を返し、`BR-SAFE-001` の「カテゴリ×スコア×しきい値」に最も素直に適合する。既存 AWS（SES）の認証情報・運用を再利用でき、**新規ベンダ・新規プライバシー面積を増やさない**。初年 5,000 件/月無料、以降 ~$1/1,000 件で個人開発規模では実質無視できる。実績が豊富。
- **Cons**: 画像バイトが **Cloudflare → AWS へ egress**（数百 ms 程度のレイテンシ増）。リージョン/エンドポイント設定が増える。フル SDK（`@aws-sdk/client-rekognition`）は Worker バンドルが肥大しうる（→ 緩和策あり）。

### 選択肢 C: 外部モデレーション SaaS（OpenAI omni-moderation / Sightengine / Hive）

- **Pros**: OpenAI `omni-moderation-latest` は無料・画像対応でカテゴリ別スコアを返し、マッピングは綺麗。Sightengine/Hive は高精度。
- **Cons**: **新規ベンダ依存**（データ処理契約・追加シークレット）とユーザー画像の外部送信が発生。Sightengine/Hive は有償。「ベンダ最小化／Cloudflare 主軸」方針と整合しにくい。

## 決定

**選択肢 B を採用する。NSFW 判定は AWS Rekognition Content Moderation で実装する。**

- `DetectModerationLabels` を呼び出し、**最上位ラベル → `category`**、**最大 `Confidence` → `score`**、**カテゴリ別しきい値超過 → `result = rejected`** にマップする。しきい値はカテゴリ別に **config 管理**する（`BR-SAFE-001`）。
- Worker バンドル肥大を避けるため、フル SDK ではなく **`aws4fetch`（軽量な SigV4 署名 fetch）** で Rekognition エンドポイントを呼ぶ。
- 判定を**ポートとして抽象化**する。オニオン構成に `NsfwModerationPort.classify(image): { result, score, category }` を定義し、環境変数でアダプタ（**Rekognition** / **local 決定論的スタブ**）を差し替える。`api`・`public-api` はともに同ポート経由で判定し、拒否時は `422` を返す。
  - local 環境は SQLite/Mailpit と同様、決定論的スタブで本番ドメインロジックを再現する（実 API を呼ばない）。
- **失敗時方針は fail-closed**: 判定エンジンがエラー/タイムアウトした場合は保存せず拒否（`422`）し、`nsfw_checks` に記録する。「健全さは前提条件」に整合させ、安全側に倒す。**bounded timeout ＋ 限定リトライ**を併用し、無限待ちを避ける。

## 結果・影響

### 正の影響

- 較正済みカテゴリスコアにより `BR-SAFE-001` の「カテゴリ×スコア×しきい値」を素直に実装でき、`nsfw_checks` への記録も自然。
- 既存 AWS ベンダの再利用で、新規ベンダ契約・新規プライバシー面積・追加シークレット系統を増やさない。
- 無料枠が潤沢で、個人開発規模では実質無料・低運用。

### 負の影響・トレードオフ

- 画像バイトが AWS へ egress し、判定レイテンシが数百 ms 程度増える（同期アップロードの応答時間に計上。現規模では許容）。
- **fail-closed のため、Rekognition 障害時はアイコンアップロードが一時的に不可**になる。→ 判定エンジンのエラー/タイムアウトを監視・アラートし（[03-logging-monitoring.md](../GUIDES/infra/03-logging-monitoring.md) §7）、早期に検知する。すり抜けは `BR-SAFE-002` の通報・管理者モデレーションで事後対応する。
- 緩和策として **判定をポート（`NsfwModerationPort`）として抽象化**し、将来 Workers AI / 外部 SaaS へ差し替えられる余地を残す。

## 将来の見直しトリガ

次のいずれかが顕在化した場合、Workers AI（ゼロ egress）または外部 SaaS への差し替えをポート単位で再評価する。

- 利用増により Rekognition のコストや egress レイテンシが問題化する。
- 判定精度（誤検知・すり抜け）が運用上の負荷になる。
- 規制・データ所在（画像の越境転送）要件が厳しくなる。

## 関連

- ビジネスルール: `BR-SAFE-001` / `BR-SAFE-002` / `BR-PROF-001` / `BR-API-006`
- 機能仕様: [06-trust-and-safety.md](../service/features/06-trust-and-safety.md) / [02-profile.md](../service/features/02-profile.md) / [05-public-api.md](../service/features/05-public-api.md)
- インフラ: [00-overview.md](../GUIDES/infra/00-overview.md) §3 / [01-network-architecture.md](../GUIDES/infra/01-network-architecture.md) §2.2 / [03-logging-monitoring.md](../GUIDES/infra/03-logging-monitoring.md) §7
- データモデル: [01-data-model.md](../GUIDES/db/01-data-model.md) §5.6（`nsfw_checks`）
- 先例（実装方式の抽象化）: [20260603-profile-search-fts5.md](./20260603-profile-search-fts5.md)
