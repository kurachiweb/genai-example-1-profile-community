# コーディング原則・規約概要 — GenAI Profile Community

本サービスのコードベース全体に適用するコーディング原則・規約を定義する。
アーキテクチャ設計は [01-architecture.md](./01-architecture.md)、静的解析/整形/コミット規約は [02-lint-format-commit.md](./02-lint-format-commit.md) を参照。

> **位置づけ**: 本ガイドは [.claude/rules/ecc-common/coding-style.md](../../../.claude/rules/ecc-common/coding-style.md)（一般原則の一次情報）と [CLAUDE.md](../../../CLAUDE.md)（技術選定）を、本サービスの実装観点へ落とし込んだものである。
> 文字数・件数・状態列挙などの**業務具体値は [docs/service/features/](../../service/features/) が正本**であり、本ガイドは値を持たず参照する。矛盾した場合は一次情報・features/ を優先して本ガイドを更新する。
> **現状フェーズ**: `apps/` 配下は未実装で、本ガイドは実装に先行する設計規約である。

## 1. 言語・記述方針

- **すべての文章は日本語**で記述する（ドキュメント・Git コミットメッセージ・コードコメント、[CLAUDE.md](../../../CLAUDE.md) 作業ルール）。識別子（変数名・関数名・型名）は英語とする。
- コメントは「なぜ（why）」を書く。「何を（what）」はコード自体で表現し、コメントに頼らない。
- 実装言語は **TypeScript** で統一する（フロント・バックエンド・共有コード）。`tsconfig` はモノレポ共通のベース設定を継承し、`strict` を有効化する。`any` の常用を避け、外部入力は型で表現する前に境界検証する（§5）。

## 2. コア原則

[.claude/rules/ecc-common/coding-style.md](../../../.claude/rules/ecc-common/coding-style.md) の原則をそのまま適用する。要点のみ再掲する。

| 原則 | 要旨 |
| --- | --- |
| KISS | 実際に動く最も単純な解を選ぶ。明快さを賢さより優先し、早すぎる最適化を避ける。 |
| DRY | 反復ロジックは共有関数/ユーティリティへ抽出する。ただし抽象化は**重複が現実になってから**（投機的に作らない）。 |
| YAGNI | 必要になるまで機能・抽象を作らない。まず単純に始め、圧力が生じたらリファクタする。 |

## 3. イミュータビリティ（最重要）

- **既存オブジェクトを破壊的に変更せず、常に新しいオブジェクトを生成する**（[ecc-common/coding-style.md](../../../.claude/rules/ecc-common/coding-style.md) CRITICAL）。
  - 配列・オブジェクトの更新はスプレッド/`map`/`filter`/`reduce` 等で新値を返す。`push`/`splice`/プロパティ直接代入で共有参照を書き換えない。
- 根拠: 隠れた副作用を防ぎ、デバッグと並行処理を安全にする。GraphQL リゾルバ・React レンダリング・Jotai/React Query のキャッシュなど、参照の同一性が挙動に影響する箇所で特に重要。
- ドメインの「状態変更」は破壊的更新ではなく**新しい状態への遷移**として表現する（例: User の状態列挙、[00-common-rules.md](../../service/features/00-common-rules.md) `COMMON-2`）。

## 4. ファイル構成・命名

### 4.1 ファイル粒度

- **小さなファイルを多く** > 大きなファイルを少なく。高凝集・低結合を保つ。
- 目安 **200〜400 行**、**最大 800 行**。超える場合はモジュールを抽出する（PreToolUse フックで 800 行超の書き込みをブロックしうる、[ecc-web/hooks.md](../../../.claude/rules/ecc-web/hooks.md)）。
- **種別ではなく機能/ドメイン単位**でディレクトリを構成する。フロントの具体例は [ecc-web/coding-style.md](../../../.claude/rules/ecc-web/coding-style.md)、バックエンドの層構成は [01-architecture.md](./01-architecture.md) を参照。
- 関数は焦点を絞り **50 行未満**を目安とする。ネストは 4 レベルを超えないよう早期 return を用いる。

### 4.2 命名規約

| 対象 | 規約 | 例 |
| --- | --- | --- |
| 変数・関数 | `camelCase`（説明的に） | `normalizeHandle`, `effectivePublic` |
| 真偽値 | `is` / `has` / `should` / `can` 接頭辞 | `isPublished`, `hasConsented` |
| 型・インターフェース・コンポーネント | `PascalCase` | `Profile`, `SnsLink`, `ProfileCard` |
| 定数 | `UPPER_SNAKE_CASE` | `MAX_BIO_LENGTH`, `RATE_LIMIT_PER_MINUTE` |
| カスタムフック | `use` 接頭辞 + `camelCase` | `useReducedMotion`, `useProfileForm` |
| マジックナンバー | 名前付き定数化（しきい値・遅延・上限） | 値の正本は features/、コードでは定数に束ねる |

- GraphQL スキーマ・DB 物理名との対応（PascalCase / snake_case）は [api/01-graphql-internal.md](../api/01-graphql-internal.md) §2.1・[db/00-overview.md](../db/00-overview.md) §3 を正本とする。

## 5. 入力検証は境界で（単一ルール）

- すべての外部入力（画面フォーム・公開 API・ファイル・外部 API 応答）は、**システム境界でスキーマ検証**してから処理する。信頼しない（`BR-COMMON-008`）。
  - フロント（`client`/`admin`）は **Zod**、バックエンド（`api`/`public-api`）は **class-validator / GraphQL スキーマ**で検証する（[CLAUDE.md](../../../CLAUDE.md)）。
- 画面・内部 API・公開 API は**同一のビジネスルール**で検証する。書き込み検証は経路によらず同一（`BR-API-006`、値の正本は [02-profile.md](../../service/features/02-profile.md)）。
- 文字列は前後トリム・制御文字除去・**NFC 正規化**を行い、文字数は**書記素クラスタ単位**で数える（`BR-COMMON-009`）。正規化はアプリ層で実施し、DB は最終防衛線とする（[db/00-overview.md](../db/00-overview.md) §2.4）。
- 失敗は早期に、フィールド単位の明確なメッセージで返す（§6）。

## 6. エラー処理

- エラーは**各層で明示的に処理**し、握りつぶさない（[ecc-common/coding-style.md](../../../.claude/rules/ecc-common/coding-style.md)）。
- 利用者向けメッセージは**日本語・一般化**（情報漏えい防止、`BR-COMMON-012`）。認証/存在確認の失敗は列挙されない統一文面にする。
- サーバー側は詳細なコンテキストを **LogTape** で構造化ログに残す。パスワード・API キー秘匿値・Cookie 値・トークンを**出力しない**（`BR-COMMON-014`、[infra/03-logging-monitoring.md](../infra/03-logging-monitoring.md)）。
- ドメイン例外は各トランスポートへ**対称に写像**する（GraphQL は `extensions.code`、REST は HTTP ステータス + 共通エンベロープ）。写像規約は [api/00-overview.md](../api/00-overview.md) §2.4、コード語彙の正本は `BR-API-011`。
- `console.log` 等のデバッグ出力をコミットに残さない（[ecc-common/code-review.md](../../../.claude/rules/ecc-common/code-review.md)）。

## 7. セキュリティ・秘匿（コード観点）

- シークレットをソースへハードコードしない。環境変数 / Wrangler Secrets / GitHub Actions Secrets を用い、起動時に必須シークレットの存在を検証する（[ecc-common/security.md](../../../.claude/rules/ecc-common/security.md)）。
- SQL はパラメータ化（MikroORM 経由）。文字列連結でクエリを組まない（[db ガイド](../db/)）。
- XSS 対策として `dangerouslySetInnerHTML` を原則使わない。やむを得ない場合のみローカルのサニタイザを通す（[ecc-web/security.md](../../../.claude/rules/ecc-web/security.md)）。
- 詳細は [docs/GUIDES/security/](../security/)（今後整備）に委譲する。

## 8. 完了前チェックリスト

実装を完了とする前に確認する（[ecc-common/coding-style.md](../../../.claude/rules/ecc-common/coding-style.md) / [code-review.md](../../../.claude/rules/ecc-common/code-review.md)）。

- [ ] 命名が明確で読みやすい
- [ ] 関数は焦点を絞っている（<50 行）/ ファイルは凝集している（<800 行）
- [ ] 深いネスト（>4 レベル）がない
- [ ] エラーを明示的に処理している
- [ ] ハードコード値がない（定数/設定/features 参照に束ねている）
- [ ] 破壊的変更がない（イミュータブルパターン）
- [ ] 新規機能にテストがある（[testing ガイド](../testing/)・カバレッジ 80%）
- [ ] デバッグ出力・秘匿値の漏えいがない

## 9. 関連ドキュメント

- アーキテクチャ設計（層・依存方向・状態管理）: [01-architecture.md](./01-architecture.md)
- 静的解析・整形・コミット規約: [02-lint-format-commit.md](./02-lint-format-commit.md)
- テスト方針（TDD・カバレッジ）: [docs/GUIDES/testing/](../testing/)
- 一般コーディング規約の一次情報: [ecc-common/coding-style.md](../../../.claude/rules/ecc-common/coding-style.md)
- 横断ビジネスルール（検証・正規化・エラー・公開ゲート）: [00-common-rules.md](../../service/features/00-common-rules.md)
