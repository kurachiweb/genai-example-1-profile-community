# 機能仕様・受け入れ条件（SSoT） — GenAI Profile Community

このディレクトリは、本サービスの **ビジネスルール・機能仕様・受け入れ条件（Acceptance Criteria）の正本（Single Source of Truth, SSoT）** である。
実装・テスト・画面仕様・API 仕様は、本ディレクトリの記述を基準とする。記述が他ドキュメントと矛盾した場合、**本ディレクトリを優先**し、他ドキュメントを追従させること。

> サービス像（なぜ・誰のために・何を）は [docs/service/overview/](../overview/) を参照。
> 本ディレクトリは「どう振る舞うべきか（What/How-behaves）」を、検証可能な粒度で定義する。

## ファイル構成（ドメインエンティティ単位）

機能群（エピック）ではなく、**ドメインエンティティ単位**で分割する。1 つのエンティティに関する制約・状態遷移・受け入れ条件を 1 ファイルに凝集させ、追跡性を高める。

| ファイル | 主担当エンティティ | 概要 | 関連エピック |
| --- | --- | --- | --- |
| [00-common-rules.md](./00-common-rules.md) | 横断（共通） | 認証・セッション、共通バリデーション、状態遷移、レスポンス/エラー規約、レート制限の基本、監査ログ、公開×メール確認の整合 | 全般 |
| [01-user-account.md](./01-user-account.md) | User（アカウント） | 登録・メール確認・ログイン・パスワード・アカウント編集・退会 | EP-01 |
| [02-profile.md](./02-profile.md) | Profile（プロフィール本体） | アイコン（NSFW 検出）・氏名・職業・自己紹介・SNS リンク | EP-02 |
| [03-profile-sharing.md](./03-profile-sharing.md) | Profile（公開・共有） | ハンドル名・固有 URL・公開/非公開・公開ページ・OGP・QR | EP-03 |
| [04-profile-discovery.md](./04-profile-discovery.md) | Profile（閲覧・検索） | ログイン不要の閲覧・一覧・名前/職業/自己紹介による絞り込み検索 | EP-04 |
| [05-public-api.md](./05-public-api.md) | ApiKey / 公開 API | API キー管理・CRUD エンドポイント・レート制限・エラー仕様 | EP-05 |
| [06-trust-and-safety.md](./06-trust-and-safety.md) | Report / Suspension | NSFW 取り扱い・通報・凍結・解除リクエストのライフサイクル | EP-06 |
| [07-admin-console.md](./07-admin-console.md) | AdminAccount | 管理者アカウント/権限（RBAC）・ユーザー管理・統計・監査ログ・API キー運用 | EP-07 |
| [08-content-and-comms.md](./08-content-and-comms.md) | Announcement / HelpArticle / Inquiry / Policy | お知らせ・メール通知・ヘルプ記事・問い合わせ・規約版管理 | EP-07 |

## ドメインエンティティ一覧

| エンティティ | 説明 | 主な定義先 |
| --- | --- | --- |
| User | サービスの会員アカウント。1 ユーザー = 1 プロフィール（1:1）。 | 01 |
| Profile | ユーザーに 1:1 で紐づくプロフィール。アカウント作成時に空の状態で生成される。 | 02 / 03 / 04 |
| SnsLink | Profile に紐づく SNS/Web リンク（0〜N 件）。 | 02 |
| ApiKey | ユーザーが発行する公開 API の認証キー（0〜N 件）。 | 05 |
| Report | 閲覧者・利用者によるプロフィール通報。 | 06 |
| Suspension | 管理者によるユーザー凍結と、その解除リクエスト。 | 06 |
| AdminAccount | 運営者（管理者）のアカウント。ロールベースの権限を持つ。 | 07 |
| Announcement | サイト内お知らせ。 | 08 |
| EmailNotification | 管理者が配信するメール通知。 | 08 |
| HelpArticle | マークダウンで編集するヘルプ記事。 | 08 |
| Inquiry | 問い合わせフォームからの送信（一般/通報/解除リクエスト）。 | 06 / 08 |
| Policy | 利用規約・プライバシーポリシー（版管理）。 | 08 |
| AuditLog | 管理者操作・重要イベントの監査記録（不変）。 | 00 / 07 |

## 記法・ドキュメント規約

### 識別子（ID）規約

各ドキュメントの仕様要素には、安定した ID を付与し相互参照・追跡に用いる。

- **ビジネスルール**: `BR-<AREA>-NNN`（例: `BR-PROF-001`）
- **受け入れ条件**: `AC-<AREA>-NNN`（例: `AC-ACCT-003`）
- **エンティティ状態**: `S-<ENTITY>-<NAME>`（例: `S-USER-FROZEN`）

`AREA` は次を用いる: `COMMON` / `ACCT` / `PROF` / `SHARE` / `DISC` / `API` / `SAFE` / `ADMIN` / `CONTENT`。

各受け入れ条件には、由来するユーザーストーリー（`US-XXXX`、[04-user-stories.md](../overview/04-user-stories.md)）を **関連ストーリー** として明記し、双方向に追跡可能にする。

### 受け入れ条件の書式（Given/When/Then）

受け入れ条件は、前提（Given）・操作（When）・期待結果（Then）のシナリオ形式で記述する。
正常系・異常系・境界値を区別し、テスト（単体/統合/E2E）のケースへ直接対応づけられる粒度を保つ。

```markdown
#### AC-PROF-001 アイコン画像の保存（正常系）

- **関連ストーリー**: US-0201
- **Given**: メール確認済みの利用者がプロフィール編集画面を開いている
- **When**: 5MB 以下・対応形式のアイコン画像を選択して保存する
- **Then**: NSFW 判定を通過した画像がトリミング後に保存され、即時にプレビューへ反映される
```

### バリデーション・制約値の表記

文字数上限・サイズ上限・件数上限・しきい値などの具体値は、**確定値**として表に明記する。
各値には「根拠」を添え、なぜその値かを将来の変更判断に役立てる。値は SSoT としてここを正本とし、変更時は本ディレクトリを更新してから実装へ反映する。

## 優先度（MoSCoW）

[04-user-stories.md](../overview/04-user-stories.md) の優先度を引き継ぐ。

- **Must**: 「手軽な共有ページ」の核に直結する必須機能
- **Should**: 価値を高めるが核ではない機能
- **Could**: あると望ましい補助的機能

## ユーザーストーリー → 機能仕様 対応表（トレーサビリティ）

| US | 概要 | 定義先 | 優先度 |
| --- | --- | --- | --- |
| US-0101 | メール/パスワードで会員登録 | [01](./01-user-account.md) | Must |
| US-0102 | ログイン・ログアウト | [01](./01-user-account.md) | Must |
| US-0103 | パスワード変更・リセット | [01](./01-user-account.md) | Must |
| US-0104 | アカウント情報の編集 | [01](./01-user-account.md) | Should |
| US-0105 | アカウント削除（退会） | [01](./01-user-account.md) | Should |
| US-0201 | アイコン画像のアップロード・変更 | [02](./02-profile.md) | Must |
| US-0202 | ファースト/ラストネーム登録 | [02](./02-profile.md) | Must |
| US-0203 | 職業・職種の登録 | [02](./02-profile.md) | Must |
| US-0204 | 自己紹介文の入力 | [02](./02-profile.md) | Should |
| US-0205 | SNS アカウントリンクの登録 | [02](./02-profile.md) | Must |
| US-0206 | 入力中の完成イメージ確認（プレビュー） | [02](./02-profile.md) | Could |
| US-0301 | 固有 URL でプロフィール公開 | [03](./03-profile-sharing.md) | Must |
| US-0302 | 公開・非公開の切り替え | [03](./03-profile-sharing.md) | Must |
| US-0303 | 固有 URL の共有（bio/名刺/署名/QR） | [03](./03-profile-sharing.md) | Must |
| US-0304 | 共有時の OGP プレビュー | [03](./03-profile-sharing.md) | Should |
| US-0401 | ログイン不要の閲覧 | [04](./04-profile-discovery.md) | Must |
| US-0402 | 各 SNS リンクへの遷移 | [04](./04-profile-discovery.md) | Must |
| US-0403 | 公開プロフィールの一覧 | [04](./04-profile-discovery.md) | Should |
| US-0404 | 名前・職業・自己紹介での絞り込み検索 | [04](./04-profile-discovery.md) | Should |
| US-0501 | API キーの発行・管理 | [05](./05-public-api.md) | Should |
| US-0502 | 公開 API でプロフィール取得（Read） | [05](./05-public-api.md) | Should |
| US-0503 | 公開 API でプロフィール CUD | [05](./05-public-api.md) | Should |
| US-0504 | レート制限の把握 | [05](./05-public-api.md) | Should |
| US-0601 | アイコンの NSFW 自動チェック | [06](./06-trust-and-safety.md) | Must |
| US-0602 | 不適切プロフィールの通報 | [06](./06-trust-and-safety.md) | Should |
| US-0603 | 凍結の解除リクエスト | [06](./06-trust-and-safety.md) | Should |
| US-0701 | ユーザー一覧の閲覧・管理 | [07](./07-admin-console.md) | Must |
| US-0702 | 不適切アイコンのモデレーション・削除 | [07](./07-admin-console.md) / [06](./06-trust-and-safety.md) | Must |
| US-0703 | 通報処理・違反ユーザー凍結 | [07](./07-admin-console.md) / [06](./06-trust-and-safety.md) | Must |
| US-0704 | 解除リクエストの審査 | [07](./07-admin-console.md) / [06](./06-trust-and-safety.md) | Should |
| US-0705 | お知らせ・メール通知の配信 | [08](./08-content-and-comms.md) | Should |
| US-0706 | 管理者アカウント・権限の管理 | [07](./07-admin-console.md) | Should |
| US-0707 | 公開 API キー・共通レート制限の管理 | [07](./07-admin-console.md) | Should |
| US-0708 | 利用統計・監査ログの閲覧 | [07](./07-admin-console.md) | Should |
| US-0709 | ヘルプ記事編集・問い合わせ対応 | [08](./08-content-and-comms.md) | Should |
| US-0710 | 規約・ポリシーの編集・版管理 | [08](./08-content-and-comms.md) | Should |

## このディレクトリの読み方

1. まず [00-common-rules.md](./00-common-rules.md) を読み、全機能に共通する前提（認証・状態遷移・公開×メール確認の整合・エラー規約）を把握する。
2. 対象機能のエンティティ別ドキュメントで、データ制約・ビジネスルール・受け入れ条件を確認する。
3. 受け入れ条件の `関連ストーリー` から [04-user-stories.md](../overview/04-user-stories.md) を辿り、背景価値を確認する。

## 関連ドキュメント

- サービス概要・コンセプト・ターゲット・ストーリー: [docs/service/overview/](../overview/)
- 用語の定義: `docs/service/glossary.md`（今後整備）
- 画面仕様・ワイヤーフレーム: `docs/service/screens/`（今後整備）
- 規約・プライバシーポリシー本文: `docs/service/policies/`（今後整備、版管理ルールは [08](./08-content-and-comms.md)）
- 機能一覧（作業者向けの俯瞰）: [README.md](../../../README.md)
