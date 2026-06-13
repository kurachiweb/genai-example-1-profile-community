# 文字・コピー・アクセシビリティ — 名前表示・代替テキスト・WCAG・国際化

「文字をどう組み、どう書き、誰もが使えるようにするか」を定義する。
本サービスは **クリエイターの名前を主役**にするため、文字組み（とりわけ名前）とアクセシビリティを設計の中心に据える。

> 基準は **WCAG 2.2 Level AA**（[ecc-accessibility スキル基準](../../../.claude/rules/ecc-web/)・[tailwind §8](../../GUIDES/coding/05-tailwind.md)・[testing/02-e2e.md §4.2](../../GUIDES/testing/02-e2e.md)）。挙動の確定値は [features/](../features/) を正本とし、本書は表現・組版・a11y を扱う。

## 1. 名前の表示組み立て（最重要）

「名前に敬意を払う」原則（[00-overview](./00-overview.md)）の実装面。

- 表示名は `firstName`/`lastName` と `nameDisplayOrder` から**決定論的に組み立て**、二重空白・前後余白を生じさせない（[BR-PROF-003](../features/02-profile.md)）。
- 表示順は `givenNameFirst`（名→姓、既定）／`familyNameFirst`（姓→名）の 2 値（[BR-PROF-004](../features/02-profile.md)）。**公開ページ・一覧・検索・OGP すべてで一貫**させる（[AC-PROF-009](../features/02-profile.md)）。
- **複合姓・多言語・長短のばらつきを崩さない**。氏名は各最大 50 文字（[BR-PROF-002](../features/02-profile.md)）。Latin・和文・結合文字・ハイフン姓（例: `Maria Garcia-Lopez`）が混在しても破綻させない（[AC-PROF-006](../features/02-profile.md)）。

### 切り詰め（truncation）方針

| 文脈 | 名前 | 職業 | 自己紹介（bio） |
| --- | --- | --- | --- |
| 公開ページ（詳細） | **切り詰めない**（折り返して全文表示） | 折り返し表示 | 全文表示（最大 500 文字、折り返し） |
| 一覧・検索カード | 行数制限＋省略（…）可。ただし**主見出しとして可能な限り見せる** | 1 行省略可 | カードには非表示（[BR-DISC-003](../features/04-profile-discovery.md) の表示項目に従う） |

- 省略する場合も、ホバー/フォーカスや詳細遷移で全文に到達できるようにする。文字数を見た目（書記素クラスタ）で扱う（[BR-COMMON-008](../features/00-common-rules.md)）。

## 2. マイクロコピー（文言）の方針

トーン & マナー「親しみやすく軽い／整っていて信頼できる」（[overview/02-concept.md](../overview/02-concept.md)）に従う。

- **日本語を既定**とし（[BR-COMMON-015](../features/00-common-rules.md)）、専門用語で身構えさせない。
- エラー・案内は**何をすればよいかが分かる**文面にする（[BR-COMMON-012](../features/00-common-rules.md)）。例: 「5 MB 以下の画像を選択してください」（[AC-PROF-002](../features/02-profile.md)）。
- 認証・存在確認に関わる失敗は、**列挙されない一般化メッセージ**で統一する（情報漏えい防止、[BR-COMMON-012](../features/00-common-rules.md)）。
- 凍結・通報・非公開など緊張しやすい場面ほど、威圧せず手続き（次の一歩）を示す（[03-components.md §6・§9](./03-components.md)）。

## 3. 代替テキスト（alt）

- **プロフィールアイコンの `alt` は表示名から自動生成**する。原則「{表示名} のプロフィールアイコン」を基本パターンとし、表示順の変更（[BR-PROF-004](../features/02-profile.md)）に追従させる。
- **氏名未設定**のときは「プロフィールアイコン」など、個人を特定しない汎用文言にフォールバックする（[03-components.md §7](./03-components.md)）。
- 既定（自動生成）アイコンも同様に表示名ベースの `alt` を与える。
- **純粋な装飾画像・アイコングリフ**は `alt=""`（空）にし、支援技術から隠す。SNS プラットフォームアイコンには、リンクのアクセシブル名（種別・ラベル）を別途与える。

## 4. アクセシビリティ（WCAG 2.2 AA）

### 4.1 構造・操作

- **セマンティック HTML を第一**に、`header`/`nav`/`main`/`section`/`footer` とランドマークで構造化する（[tailwind §8](../../GUIDES/coding/05-tailwind.md)）。一覧の各プロフィールカードは**表示名を主見出し**にする（[BR-DISC-007](../features/04-profile-discovery.md)）。
- **キーボードだけで全操作可能**にする。リンク並べ替え等のドラッグ操作には**キーボード代替**を用意する（[03-components.md §3](./03-components.md)）。
- **フォーカスは常に可視**（`focus-visible`、[03-components.md §1](./03-components.md)）。フォーカス順序は DOM 順＝視覚的優先順＝読み上げ順に一致させる（[02-layout §1](./02-layout.md)）。

### 4.2 知覚・色・モーション

- コントラストは **AA**（本文 4.5:1／大文字・UI 3:1）を満たす（[01-foundations §2.4](./01-foundations.md)）。
- **色だけで意味を伝えない**。状態（成功/警告/エラー/選択）はアイコン・テキストを併用する（[01-foundations §2.3](./01-foundations.md)）。
- **ターゲットサイズ**（WCAG 2.2 の対象サイズ）と十分なヒットエリアを確保する（[02-layout §5](./02-layout.md)）。
- **`prefers-reduced-motion` を尊重**し、低減設定時は過度な動きを抑える（[01-foundations §6](./01-foundations.md)・[testing/02-e2e.md §4.2](../../GUIDES/testing/02-e2e.md)）。

### 4.3 フォーム

- すべての入力にラベルを関連付け、エラーは**フィールドに紐づけて**支援技術へ伝える（`aria-describedby` 等）。入力値を失わせない（[BR-PROF-010](../features/02-profile.md)）。
- 検証は ESLint（`jsx-a11y`）と axe（jest-axe / @axe-core/playwright）で確認する（[testing/02-e2e.md §4.2](../../GUIDES/testing/02-e2e.md)）。

## 5. 国際化・日時・文字の安全性

- **日時は閲覧者のローカルタイムで表示**し、保存は UTC（[BR-COMMON-015](../features/00-common-rules.md)）。世界中の閲覧者が各自の現地時間で日時を読めることを意図する。相対表記（例: 3 日前）を使う場合も実日時を補助提示する。
- 名前・自己紹介は Unicode を許容し、表示前提として **NFC 正規化**・不可視/紛らわしい文字の除去を前提に組む（[BR-COMMON-009](../features/00-common-rules.md)。ホモグラフ・表示崩れ・双方向制御の防止）。
- 自己紹介はプレーンテキスト（HTML 不可）。表示時にエスケープし、URL はサニタイズ後のみ自動リンク化する（[BR-PROF-006/008](../features/02-profile.md)。`javascript:` 等の危険スキームは除外）。

## 6. 検証（デザイン品質の担保）

- **ビジュアル回帰**: 主要ブレークポイント 320/375/768/1024/1440/1920、ライト・ダーク双方、公開ページ・一覧・編集の主要状態を対象にする（[testing/02-e2e.md §4](../../GUIDES/testing/02-e2e.md)・[.claude/rules/ecc-web/testing.md](../../../.claude/rules/ecc-web/testing.md)）。
- **アクセシビリティ**: 自動チェック（axe）＋キーボード操作＋reduced-motion＋コントラストを確認する。
- コンポーネントカタログ（Storybook、[apps/frontend-lib/components/](../../../apps/frontend-lib/components/)）で状態を一覧化し、設計と実装の差分を早期に見つける。

## 7. 関連ドキュメント

- 原則・トーン: [00-overview.md](./00-overview.md) / [overview/02-concept.md](../overview/02-concept.md)
- 色・コントラスト・タイポ: [01-foundations.md](./01-foundations.md)
- 配置・名前の階層: [02-layout.md](./02-layout.md)
- 部品と状態: [03-components.md](./03-components.md)
- 挙動 SSoT（名前・bio・共通規約）: [02-profile.md](../features/02-profile.md) / [00-common-rules.md](../features/00-common-rules.md)
- a11y・ビジュアル回帰テスト: [testing/02-e2e.md](../../GUIDES/testing/02-e2e.md)
