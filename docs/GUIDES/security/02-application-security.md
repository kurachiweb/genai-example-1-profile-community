# アプリケーションセキュリティ — GenAI Profile Community

セキュリティヘッダ・CSP・XSS/CSRF 対策・入力検証/正規化・ファイルアップロード安全性・CORS・シークレット管理など、アプリ層の横断的な防御を定義する。

> 全体像は [00-overview.md](./00-overview.md)、認証認可は [01-authn-authz.md](./01-authn-authz.md)。
> **一次情報**: コーディング規約としてのセキュリティは [.claude/rules/ecc-web/security.md](../../../.claude/rules/ecc-web/security.md)・[.claude/rules/ecc-common/security.md](../../../.claude/rules/ecc-common/security.md) が一次情報。横断ビジネスルールは `BR-COMMON-004`/`008`/`009`/`014`。本ガイドは本サービスへの適用方針に限定し、しきい値・上限の値は再掲しない。
> **現状フェーズ**: `apps/` 配下は未実装で、本ガイドは実装に先行する設計仕様である。

## 1. トランスポート・セキュリティヘッダ

本番では全レスポンスに以下を付与する（`BR-COMMON-004`、ヘッダ一覧の一次情報は [ecc-web/security.md](../../../.claude/rules/ecc-web/security.md)）。Cloudflare エッジまたは各 Worker のレスポンスで一律に付与する。

| ヘッダ | 値（方針） | 目的 |
| --- | --- | --- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | HTTPS 強制・ダウングレード防止 |
| `Content-Security-Policy` | §2 を参照（nonce ベース） | XSS・データ注入の緩和 |
| `X-Content-Type-Options` | `nosniff` | MIME スニッフィング防止 |
| `X-Frame-Options` | `DENY` | クリックジャッキング防止（公開ページの埋め込み要件に応じ調整） |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | リファラ経由の情報漏えい抑制 |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | 不要なブラウザ機能の無効化 |

- HTTPS は本番の前提。トランスポート・HSTS 等の正本は本ガイドと本番エッジ設定（[infra/00-overview.md](../infra/00-overview.md)）。
- 公開ページの OGP/クローラ要件（実効公開のみ `index`、`BR-SHARE-007`/`010`）と矛盾しない範囲でヘッダを設定する。

## 2. Content Security Policy（CSP）

- **nonce ベース CSP** を採用し、スクリプトに `'unsafe-inline'` を使わない。Next.js（client/admin）ではリクエストごとに nonce を発行し、許可するスクリプト/接続先（内部 API・Cloudflare Images・Sentry 等）に限定する。
- 許可オリジンは本サービスの実依存（内部 GraphQL・`api.example.com`・Cloudflare Images・Sentry DSN ホスト等）に合わせて定義し、雛形をそのまま流用しない（[ecc-web/security.md](../../../.claude/rules/ecc-web/security.md) の注記）。
- `frame-src 'none'` / `object-src 'none'` / `base-uri 'self'` を基本とし、外部スクリプトを使う場合は SRI を付す。具体の origin 設計は実装着手時に確定し、本ガイドへ反映する。

## 3. XSS 対策

- ユーザー由来の HTML を**サニタイズせずに注入しない**。`innerHTML` / `dangerouslySetInnerHTML` は原則使わず、必要時は事前にサニタイズする（[ecc-web/security.md](../../../.claude/rules/ecc-web/security.md)）。
- **マークダウンを受け付ける面は安全なサブセットのみ許可**し、生 HTML・スクリプトを無効化する。対象とその正本:

| 面 | 正本 |
| --- | --- |
| プロフィール自己紹介 | `BR-PROF-008`（[02-profile.md](../../service/features/02-profile.md)） |
| お知らせ本文 | `BR-CONTENT-001`（[08-content-and-comms.md](../../service/features/08-content-and-comms.md)、`AC-CONTENT-002`） |
| ヘルプ記事・規約本文 | `BR-CONTENT-005`/`008` |

- サニタイズは実績あるローカルライブラリで行い、表示時にエスケープを徹底する。

## 4. CSRF 対策

- **状態変更を伴う画面操作（フォーム送信・mutation）には CSRF 対策**を施す（同一サイト Cookie ＋ トークン、`BR-COMMON-004`）。`SameSite=Lax` Cookie と二重送信トークン等を併用する。
- **公開 API は Cookie を用いず API キー認証のみ**のため、ブラウザ自動 Cookie 送信に起因する CSRF 面が構造的に縮小される（[api/02-public-rest-api.md](../api/02-public-rest-api.md) §6、[01-authn-authz.md](./01-authn-authz.md) §1）。画面操作側の CSRF 対策とは別系統として扱う。

## 5. 入力検証・正規化

- すべての外部入力（画面フォーム・公開 API・ファイル）は、**システム境界でスキーマ検証**してから処理する（client は Zod、api は class-validator / GraphQL スキーマ、`BR-COMMON-008`）。信頼しない。
- 文字列は前後空白をトリムし、制御文字を除去、文字数は**書記素クラスタ単位**で数える。保存前に **NFC 正規化**し、ゼロ幅・両方向制御文字など不可視/紛らわしい文字を除去または拒否する（`BR-COMMON-008`/`009`。なりすまし・ホモグラフ攻撃・表示崩れの防止）。
- 検証ルールの**値の正本は features/**（氏名必須・文字数・SNS リンク件数・`https` のみ・ハンドル形式/予約語 等。`BR-PROF-*`/`BR-SHARE-*`）。画面と公開 API で**同一のルール**を適用する（`BR-API-006`）。
- 検証失敗は早期に、フィールド単位の明確なメッセージで返す（`BR-COMMON-012`、公開 API は `error.details`）。

## 6. ファイルアップロード安全性（アイコン）

アイコンアップロードは攻撃面が大きいため、クライアント・サーバーの二段で検証する（フローの正本は [infra/01-network-architecture.md](../infra/01-network-architecture.md) §2.2）。

- **形式・サイズ・寸法の検証**: 対応形式・最大サイズ・寸法を検証する（値の正本は `BR-PROF-001`、[02-profile.md](../../service/features/02-profile.md)）。クライアント検証は UX 目的であり、**サーバー側で必ず再検証**する。
- **EXIF 除去**: 保存前に EXIF（位置情報等）を除去する。
- **NSFW 自動判定（fail-closed）**: AWS Rekognition でカテゴリ別スコア×しきい値により判定し、しきい値超過は保存せず拒否、判定エンジン障害時も保存しない（`BR-SAFE-001`、[ADR NSFW](../../adr/20260603-nsfw-moderation-rekognition.md)）。拒否時は詳細な判定理由を晒さず一般化したメッセージを返す（回避テクニック誘発の防止）。
- **配信**: 原本は R2、配信は Cloudflare Images（正規化済み）。秘匿値（直リンクの推測等）に依存しない設計とする。

## 7. CORS（公開 API）

- 公開 API はブラウザ埋め込み（`read` キー、`BR-API-010b`）の利用形態を想定し、**API キー前提で必要最小限のメソッド・ヘッダ（`Authorization` 等）に限って許可**する（[api/02-public-rest-api.md](../api/02-public-rest-api.md) §6）。
- 許可オリジンの具体方針は実装着手時に定め、本ガイドの横断方針と整合させる。内部 GraphQL（`api`）は client/admin からのみ到達し、公開 API とは別境界とする。

## 8. シークレット管理

- 秘匿値（SES 認証情報・Sentry DSN・内部署名鍵・DB 接続情報・API キー）は **Wrangler Secrets**（ランタイム）／**GitHub Actions Secrets**（CI）で管理し、リポジトリ・ログ・エラー出力に**含めない**（`BR-COMMON-014`、正本は [infra/02-deployment.md](../infra/02-deployment.md) §6）。
- **多重防御**: pre-commit で Gitleaks（`--staged`）、CI で TruffleHog を実行し、機密情報の push を防止する（[coding/02-lint-format-commit.md](../coding/02-lint-format-commit.md)）。
- 露出が疑われるシークレットは**即時ローテーション**する。手順は [03-monitoring-and-response.md](./03-monitoring-and-response.md) §4。
- ログに秘匿値を出さない方針の具体（パスワード・キー秘匿値・Cookie 値・トークン・確認/リセットリンク実値の非出力）は [infra/03-logging-monitoring.md](../infra/03-logging-monitoring.md) §2.3 を参照。

## 9. 濫用対策・レート制限（アプリ層）

- レート制限はエッジ（WAF）とアプリ層（@nestjs/throttler）の二層で多層防御する。しきい値・カウンタ配置の正本は `BR-COMMON-010`・[infra/01-network-architecture.md](../infra/01-network-architecture.md) §3。本ガイドでは値を再掲しない。
- フォーム送信（通報・問い合わせ）は**ハニーポット等の軽量な anti-abuse**を用い、重いCAPTCHA を既定にしない（[ecc-web/security.md](../../../.claude/rules/ecc-web/security.md)、`BR-CONTENT-006`）。
- 認証系の連続失敗はバックオフと監査記録の対象（`BR-ACCT-004`/`008`）。

## 10. 関連ドキュメント

- セキュリティ全体像・脅威モデル: [00-overview.md](./00-overview.md)
- 認証認可設計: [01-authn-authz.md](./01-authn-authz.md)
- セキュリティ監視・脆弱性管理・インシデント対応: [03-monitoring-and-response.md](./03-monitoring-and-response.md)
- セキュリティヘッダ/CSP/XSS/フォーム（一次情報）: [ecc-web/security.md](../../../.claude/rules/ecc-web/security.md)
- 横断ルール（検証・正規化・CSRF・個人データ）: [00-common-rules.md](../../service/features/00-common-rules.md)
- アイコン仕様・NSFW・自己紹介サニタイズ: [02-profile.md](../../service/features/02-profile.md) / [06-trust-and-safety.md](../../service/features/06-trust-and-safety.md)
- 公開 API の CORS・キー秘匿: [api/02-public-rest-api.md](../api/02-public-rest-api.md) §6
- シークレット管理・デプロイ: [infra/02-deployment.md](../infra/02-deployment.md)
