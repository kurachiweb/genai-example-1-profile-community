# サービス内用語集 — GenAI Profile Community

本サービス「GenAI Profile Community」に登場するドメイン用語（サービス固有の業務用語）を、プロジェクトに参加したばかりの人でも理解できるよう一箇所にまとめた索引である。
仕様書（features/）・概要（overview/）を読む際の「言葉の地図」として使うことを想定する。

> **正本（SSoT）について**: 各用語の具体値（文字数上限・期限・しきい値など）や厳密な振る舞いは、機能仕様 [docs/service/features/](./features/) を正本とする。本書の数値は理解の助けとして併記するが、矛盾した場合は features/ を優先する。

## この用語集の使い方

- **収録範囲**: サービスのドメイン用語（業務上の概念・エンティティ・状態・ロールなど）を中心に収録する。技術スタックや実装の用語は最小限に留め、ドメインの理解に必要なものだけを扱う。
- **表記**: 各セクションを「用語（英語・別名）／意味／参照」の表で示す。「参照」は詳細を定義する仕様書へのリンクである。
- **読む順番の目安**: まず [1. サービスの基本](#1-サービスの基本) と [2. アカウントとユーザー状態](#2-アカウントとユーザー状態) を押さえると、他セクションが読みやすい。
- **関連ドキュメント**: サービス像は [overview/](./overview/)、機能の詳細は [features/](./features/)、全体像は [README.md](../../README.md) を参照。

---

## 1. サービスの基本

サービスのコンセプトと、登場する人物（ロール）に関する用語。

| 用語（英語・別名） | 意味 | 参照 |
| --- | --- | --- |
| GenAI Profile Community | 本サービスの名称。アイコン・名前・職業・自己紹介・SNS リンクを固有 URL の公開ページにまとめて共有できるプロフィール共有サービス。 | [01-overview.md](./overview/01-overview.md) |
| プロフィールカード | 名前・肩書き・リンクを 1 枚にまとめた自己紹介ページ、というサービスの体験の比喩。名刺やリンク集の代わりになる。 | [01-overview.md](./overview/01-overview.md) |
| 手軽な共有ページ | サービスの核となる価値を一言で表したコンセプトステートメント。多機能 SNS でもポートフォリオ CMS でもなく、「自己紹介とリンクを速く・きれいに・安全にまとめて渡す」一点に価値を集中させる。 | [02-concept.md](./overview/02-concept.md) |
| 3 つの速さ | コンセプトの核。「作るのが速い」「渡すのが速い」「見るのが速い」の 3 点。すべての設計判断はこれを損なわないかで評価する。 | [02-concept.md](./overview/02-concept.md) |
| 作るのが速い（Time to First Profile） | 会員登録から公開までを迷わせず、最短数分でプロフィールを完成させられること。 | [02-concept.md](./overview/02-concept.md) |
| 渡すのが速い（Shareability） | 1 ユーザー = 1 固有 URL を、SNS bio・名刺・署名・QR などどこにでも置いて渡せること。 | [02-concept.md](./overview/02-concept.md) |
| 見るのが速い（Glanceability） | 受け取った相手がログイン不要で、名前・肩書き・リンクを一目で把握できること。 | [02-concept.md](./overview/02-concept.md) |
| 利用者 | プロフィールを作成・公開するユーザー。会員登録した本人。 | [04-user-stories.md](./overview/04-user-stories.md) |
| 閲覧者 | プロフィールを見る側。多くは未ログインで、共有された URL や一覧・検索からアクセスする。 | [04-user-stories.md](./overview/04-user-stories.md) |
| 開発者 | 公開 API を使ってプロフィールを取得・更新するユーザー。多くは利用者本人でもある。 | [04-user-stories.md](./overview/04-user-stories.md) |
| 管理者 | サービスを運営する側。管理者コンソールからモデレーションや運用を行う。 | [07-admin-console.md](./features/07-admin-console.md) |
| 利用者アプリ（client） | 利用者・閲覧者が使う Web アプリ。管理者コンソールとはアプリ・セッションを分離する。 | [00-common-rules.md](./features/00-common-rules.md) |
| 管理者コンソール（admin） | 運営チームが使う管理用 Web アプリ。利用者アプリとは別アプリ・別セッション。 | [07-admin-console.md](./features/07-admin-console.md) |
| ペルソナ | 想定ユーザー像を具体化した架空の人物像（里中 みなと、小田原 風香 等）。設計判断の拠り所にする。 | [03-target-users.md](./overview/03-target-users.md) |
| アンチペルソナ | 「手軽さ」の核を守るため、あえて主対象としない層（本格ポートフォリオ運用・SNS 的交流・EC を求める層）。 | [03-target-users.md](./overview/03-target-users.md) |

---

## 2. アカウントとユーザー状態

会員アカウント（User）と、その状態・ライフサイクルに関する用語。

| 用語（英語・別名） | 意味 | 参照 |
| --- | --- | --- |
| User（アカウント） | サービスの会員アカウント。1 ユーザー = 1 プロフィール（1:1）で、作成時に空の Profile が自動生成される。 | [01-user-account.md](./features/01-user-account.md) |
| メール確認 | 登録時に送られる確認リンク（トークン、有効 24 時間・ワンタイム）を開いて、メールアドレスの到達性を確認する手続き。完了すると状態が `ACTIVE` になる。 | [01-user-account.md](./features/01-user-account.md) |
| アカウント状態（status） | User が取りうる状態。`UNVERIFIED`／`ACTIVE`／`FROZEN`／`WITHDRAWN` のいずれか。全機能がこの状態を尊重する。 | [00-common-rules.md](./features/00-common-rules.md) |
| 未確認（`S-USER-UNVERIFIED`） | 登録直後でメール未確認の状態。ログイン・編集は可能だが、第三者への公開（実効公開）はできない。 | [00-common-rules.md](./features/00-common-rules.md) |
| 有効（`S-USER-ACTIVE`） | メール確認済みで通常利用できる状態。公開・公開 API・一覧/検索露出が可能になる。 | [00-common-rules.md](./features/00-common-rules.md) |
| 凍結（`S-USER-FROZEN`） | 管理者により凍結された状態。公開停止・API 無効・編集制限。ログインと解除リクエストのみ可能。 | [06-trust-and-safety.md](./features/06-trust-and-safety.md) |
| 退会済み（`S-USER-WITHDRAWN`） | 本人が退会した終端状態。公開停止・匿名化済みで復旧不可。ログイン不可。 | [01-user-account.md](./features/01-user-account.md) |
| 状態遷移 | 状態が変わる道筋。`UNVERIFIED →（メール確認）→ ACTIVE →（凍結/解除）→ FROZEN/ACTIVE`、いずれからも `WITHDRAWN`（終端）。 | [00-common-rules.md](./features/00-common-rules.md) |
| 退会（アカウント削除） | 利用をやめる操作。即時に公開停止し、本人特定可能データを削除・匿名化し、API キーを失効する。復旧不可で、公開 API からは実行できない。 | [01-user-account.md](./features/01-user-account.md) |
| 匿名化 | 退会時などに、本人を特定できるデータを削除または識別不能化する処理。監査・不正対策に必要な記録は匿名化のうえ保持する。 | [01-user-account.md](./features/01-user-account.md) |
| パスワードリセット | パスワードを忘れた未ログイン時に、メール経由のトークン（有効 1 時間・ワンタイム）で再設定する手続き。完了で全セッションを無効化する。 | [01-user-account.md](./features/01-user-account.md) |
| 列挙防止 | アカウントの存在有無を第三者に推測させないための方針。登録・ログイン・リセットで、成否によらず同一のメッセージを返す。 | [00-common-rules.md](./features/00-common-rules.md) |
| トランザクションメール | 本人の安全・本人確認に必須のメール（メール確認・パスワードリセット・重要なセキュリティ通知）。受信設定に関わらず送信する。 | [08-content-and-comms.md](./features/08-content-and-comms.md) |

---

## 3. プロフィール

プロフィール本体（Profile）の各項目に関する用語。公開・共有は [4. 公開・共有](#4-公開共有) を参照。

| 用語（英語・別名） | 意味 | 参照 |
| --- | --- | --- |
| Profile（プロフィール） | User に 1:1 で紐づくプロフィール本体。アイコン・氏名・職業・自己紹介・SNS リンク・公開設定を持つ。 | [02-profile.md](./features/02-profile.md) |
| アイコン画像 | プロフィールの顔となる画像。PNG/JPEG/WebP・最大 5 MB。正方形にトリミングして正規化し、アップロード時に NSFW 自動検出の対象となる。 | [02-profile.md](./features/02-profile.md) |
| 既定アイコン | アイコン未設定時・削除時に表示される自動生成のプレースホルダ。「デフォルトで完成する」原則を支える。 | [02-profile.md](./features/02-profile.md) |
| 氏名（ファースト/ラスト） | プロフィールの名前。firstName・lastName ともに必須（各最大 50 文字）。複合姓・海外名も崩さず扱う（「名前に敬意を払う」原則）。 | [02-profile.md](./features/02-profile.md) |
| 表示名 | firstName・lastName と表示順から決定論的に組み立てた、画面・一覧・OGP・検索で一貫して使う名前。 | [02-profile.md](./features/02-profile.md) |
| 表示順（nameDisplayOrder） | 名前を並べる順序。`givenNameFirst`（名→姓、既定）／`familyNameFirst`（姓→名）の 2 値。 | [02-profile.md](./features/02-profile.md) |
| 職業（occupation・肩書き） | 何をしている人かを一目で伝える短い肩書き（任意・最大 50 文字・単一行）。 | [02-profile.md](./features/02-profile.md) |
| 自己紹介文（bio） | 肩書きを補足する自由記述（任意・最大 500 文字・プレーンテキスト）。HTML は不可で、表示時にエスケープする。 | [02-profile.md](./features/02-profile.md) |
| SNS リンク（SnsLink） | プロフィールに紐づく SNS/Web リンク（0〜10 件）。種別と `https://` の URL を持ち、表示順を並べ替えられる。 | [02-profile.md](./features/02-profile.md) |
| 種別（platform） | SNS リンクの分類。`x`／`github`／`linkedin`／`instagram`／`youtube`／`facebook`／`tiktok`／`website`（その他汎用 Web）。 | [02-profile.md](./features/02-profile.md) |
| ライブプレビュー | 編集中に、保存前の入力値で公開ページの完成イメージを確認できる機能（Could 優先度）。 | [02-profile.md](./features/02-profile.md) |

---

## 4. 公開・共有

ハンドル名・固有 URL・公開設定・共有導線に関する用語。**ここが「渡すのが速い」体験の核**。

| 用語（英語・別名） | 意味 | 参照 |
| --- | --- | --- |
| ハンドル名（handle） | ユーザーごとに一意の公開用識別子。半角英小文字・数字・ハイフン（3〜30 文字）。固有 URL の末尾になる。 | [03-profile-sharing.md](./features/03-profile-sharing.md) |
| 固有 URL | 公開ページの恒久的なアドレス `https://<service-domain>/@{handle}`。これ 1 つを渡せば自己紹介が完結する。 | [03-profile-sharing.md](./features/03-profile-sharing.md) |
| 予約語 | ルーティング衝突や公式詐称を防ぐため、ハンドルに使えない語（`admin`／`api`／`login`／`help` 等）。 | [03-profile-sharing.md](./features/03-profile-sharing.md) |
| 予約保持 | ハンドル変更・退会で手放した旧ハンドルを、なりすまし防止のため一定期間（30 日）他者に取得させず確保すること。 | [03-profile-sharing.md](./features/03-profile-sharing.md) |
| 公開設定（visibility） | プロフィールを公開するかの設定。`public`（公開、既定）／`private`（非公開）の 2 値。利用者がいつでも切り替えられる。 | [03-profile-sharing.md](./features/03-profile-sharing.md) |
| 公開既定値 | 新規 Profile の visibility の初期値。コンセプトに沿い `public`（公開）とする。 | [00-common-rules.md](./features/00-common-rules.md) |
| 公開ゲート | 「公開設定が public でも、実際に第三者へ公開してよいか」を判定する関門。所有者がメール確認済み（ACTIVE）かどうかで通過可否が決まる。 | [00-common-rules.md](./features/00-common-rules.md) |
| 実効公開（effectivePublic） | 実際に一般公開される条件を表すサービス共通の判定。「visibility が public **かつ** 所有者が ACTIVE」のときだけ真。一覧・検索・公開 API・公開ページのすべてで統一して用いる。 | [00-common-rules.md](./features/00-common-rules.md) |
| 公開ページ | ログイン不要で閲覧できるプロフィールの表示画面。「アイコン→名前→職業→リンク」の視線の流れで提示する。 | [03-profile-sharing.md](./features/03-profile-sharing.md) |
| `404` 相当（秘匿） | 非公開・未確認・凍結・退会・存在しないハンドルへのアクセスに対し、存在や状態を漏らさないため一律「見つかりません」を返す扱い。 | [03-profile-sharing.md](./features/03-profile-sharing.md) |
| OGP（Open Graph Protocol） | SNS 等に URL を貼ったときに表示されるプレビュー（タイトル・説明・画像）を制御するメタ情報。共有時の第一印象を整える。非公開ページでは個人情報を含めない。 | [03-profile-sharing.md](./features/03-profile-sharing.md) |
| QR コード | 固有 URL を符号化した二次元コード。名刺・イベントで URL を渡す用途。個人情報は直接埋め込まない。 | [03-profile-sharing.md](./features/03-profile-sharing.md) |
| 共有導線 | 固有 URL のワンタップコピーや主要 SNS への共有ボタンなど、URL を渡しやすくする仕組み。 | [03-profile-sharing.md](./features/03-profile-sharing.md) |

---

## 5. 閲覧・検索

閲覧者が公開プロフィールを見つけて見るための用語。

| 用語（英語・別名） | 意味 | 参照 |
| --- | --- | --- |
| 一覧 | 実効公開のプロフィールを並べて表示する画面（1 ページ 20 件・新着順）。アイコン・表示名・職業を表示する。 | [04-profile-discovery.md](./features/04-profile-discovery.md) |
| 検索 | 表示名（氏名）と職業を対象にした絞り込み（部分一致・大文字小文字非依存）。自己紹介・SNS リンクは v1 の対象外。 | [04-profile-discovery.md](./features/04-profile-discovery.md) |
| カーソルページング | 「次の開始位置（カーソル）」を渡して続きを取得するページ送り方式。大量データでも重複・欠落が起きにくい。一覧・検索・公開 API で共通。 | [04-profile-discovery.md](./features/04-profile-discovery.md) |
| 鮮度・整合 | 公開→非公開、凍結、退会、ハンドル変更を一覧・検索結果へ速やかに反映すること（短い TTL）。非公開化したプロフィールが残り続けるのを防ぐ。 | [04-profile-discovery.md](./features/04-profile-discovery.md) |

---

## 6. 公開 API

API キーで認証してプロフィールを操作する仕組みに関する用語。「API も一級の入り口」という原則に基づく。

| 用語（英語・別名） | 意味 | 参照 |
| --- | --- | --- |
| 公開 API | API キーを持つ開発者が、自身のプロフィールを CRUD し、他ユーザーの公開プロフィールを取得できる RESTful API。画面と対等な「一級の入り口」。 | [05-public-api.md](./features/05-public-api.md) |
| API キー（ApiKey） | 公開 API の認証情報。ユーザーに紐づき、その本人の権限で動作する。発行時に一度だけ全体表示し、サーバーにはハッシュで保存する（再表示不可）。 | [05-public-api.md](./features/05-public-api.md) |
| 本人フル CRUD | API キー所有者が自分のプロフィールに対して作成・取得・更新・削除を行えること。`DELETE` はプロフィール内容を消去し非公開化する（アカウントは消さない）。 | [05-public-api.md](./features/05-public-api.md) |
| 他者公開分 Read | 他ユーザーのプロフィールは、実効公開のものに限り取得（Read）できること。非公開・未確認・凍結・退会は `404` で秘匿する。 | [05-public-api.md](./features/05-public-api.md) |
| レスポンスエンベロープ | 公開 API の応答を統一する封筒形式。`success`／`data`／`error`／`meta` を持つ。成否を一貫した形で返す。 | [00-common-rules.md](./features/00-common-rules.md) |
| レート制限（Rate Limit） | 一定時間あたりのリクエスト数の上限。濫用やスクレイピングを抑止する。公開 API は既定 60 リクエスト/分（キー単位）で、超過時は `429` を返す。 | [00-common-rules.md](./features/00-common-rules.md) |
| 共通しきい値 | 公開 API の全キーに一律で適用されるレート制限値。管理者が変更できる。 | [07-admin-console.md](./features/07-admin-console.md) |

---

## 7. 健全性・安全性（Trust & Safety）

「健全さは前提条件」という原則を支える、不適切コンテンツ対応の用語。

| 用語（英語・別名） | 意味 | 参照 |
| --- | --- | --- |
| Trust & Safety | サービスの健全性・安全性を保つ取り組みの総称。NSFW 自動検出・通報・凍結・解除リクエストを土台に組み込む。 | [06-trust-and-safety.md](./features/06-trust-and-safety.md) |
| NSFW（Not Safe For Work・不適切画像） | 職場や公共の場で表示するのにふさわしくない画像（露骨な性的表現・暴力等）。アイコンは自動判定し、しきい値超過なら保存せず拒否する。 | [06-trust-and-safety.md](./features/06-trust-and-safety.md) |
| 通報（Report） | 閲覧者・利用者が問い合わせフォーム（カテゴリ「通報」）から不適切なプロフィールを報告する仕組み。ログイン不要。 | [06-trust-and-safety.md](./features/06-trust-and-safety.md) |
| 通報理由カテゴリ | 通報の分類。`inappropriate_image`（不適切画像）／`impersonation`（なりすまし）／`spam`（スパム）／`other`（その他）。 | [06-trust-and-safety.md](./features/06-trust-and-safety.md) |
| 通報のライフサイクル | 通報の状態の流れ。`OPEN →（確認/対応中）→ IN_REVIEW → RESOLVED（対応完了）／DISMISSED（却下）`。 | [06-trust-and-safety.md](./features/06-trust-and-safety.md) |
| モデレーション | 管理者が不適切なコンテンツに対処する運用。アイコン削除・ユーザー凍結・通報審査などを含む。 | [07-admin-console.md](./features/07-admin-console.md) |
| 凍結（Suspension） | 管理者が違反ユーザーの利用を制限する処分。状態が `FROZEN` になり、公開停止・編集不可・API 無効になる（ログインと解除リクエストのみ可能）。 | [06-trust-and-safety.md](./features/06-trust-and-safety.md) |
| 解除リクエスト | 凍結されたユーザーが、問い合わせフォーム（カテゴリ「解除リクエスト」）から凍結解除を申請する手続き。連投はレート制限される。 | [06-trust-and-safety.md](./features/06-trust-and-safety.md) |
| 解除リクエストのライフサイクル | 申請の状態の流れ。`PENDING →（管理者審査）→ APPROVED（解除：FROZEN→ACTIVE）／REJECTED（却下：FROZEN 継続）`。 | [06-trust-and-safety.md](./features/06-trust-and-safety.md) |

---

## 8. 管理者・運営

管理者コンソールでのガバナンス（権限・統計・監査）に関する用語。

| 用語（英語・別名） | 意味 | 参照 |
| --- | --- | --- |
| AdminAccount（管理者アカウント） | 運営者のアカウント。利用者アカウントとは別エンティティ・別ストアで管理し、ロールベースの権限を持つ。 | [07-admin-console.md](./features/07-admin-console.md) |
| RBAC（ロールベースアクセス制御） | 管理者の操作可否を「ロール（役割）」単位で制御する仕組み。最小権限の原則に従う。 | [07-admin-console.md](./features/07-admin-console.md) |
| `super_admin`（最上位管理者） | 全権限を持つロール。管理者アカウント・権限の管理、API しきい値変更、規約公開を行える。 | [07-admin-console.md](./features/07-admin-console.md) |
| `moderator`（モデレーター） | ユーザー管理（凍結/解除/アイコン削除）と通報・解除リクエスト処理を行えるロール。 | [07-admin-console.md](./features/07-admin-console.md) |
| `support`（サポート） | 問い合わせ対応・ヘルプ記事編集・お知らせ下書きを行えるロール。ユーザー処分は不可。 | [07-admin-console.md](./features/07-admin-console.md) |
| `viewer`（閲覧のみ） | 統計・監査ログ・各種一覧の閲覧のみ可能なロール。変更操作は不可。 | [07-admin-console.md](./features/07-admin-console.md) |
| 最小権限の原則 | 各操作にはそれに対応する権限のみを要求し、不要な権限を与えない設計方針。 | [07-admin-console.md](./features/07-admin-console.md) |
| ロックアウト防止 | 自分自身の権限剥奪や、最後のスーパー管理者の削除を禁じ、誰も管理できなくなる事態を防ぐ仕組み。 | [07-admin-console.md](./features/07-admin-console.md) |
| 利用統計 | 登録数・実効公開数・通報件数・凍結件数・API リクエスト量などの集計指標。個人特定を伴わない形で提示する。 | [07-admin-console.md](./features/07-admin-console.md) |
| 監査ログ（AuditLog） | 管理者操作や重要イベントを記録する追記専用（改ざん不可）のログ。操作者・対象・日時・結果などを残し、説明責任と追跡に用いる。 | [00-common-rules.md](./features/00-common-rules.md) |

---

## 9. お知らせ・通知・コンテンツ

利用者への情報発信、問い合わせ、規約に関する用語。

| 用語（英語・別名） | 意味 | 参照 |
| --- | --- | --- |
| お知らせ（Announcement） | 管理者が作成・公開するサイト内のお知らせ。マークダウンで記述し、公開開始/終了日時と重要度を持つ。 | [08-content-and-comms.md](./features/08-content-and-comms.md) |
| メール通知（EmailNotification） | 管理者が利用者へ配信するメール。配信前にプレビュー・テスト送信ができ、配信は監査ログに記録する。 | [08-content-and-comms.md](./features/08-content-and-comms.md) |
| お知らせ系メール | お知らせ告知など、本人が受信可否を選べる（オプトアウト可能な）メール。トランザクションメールとは区別する。 | [08-content-and-comms.md](./features/08-content-and-comms.md) |
| オプトアウト | お知らせ系メールの受信を停止すること。配信停止リンクから行える。トランザクションメールは対象外。 | [08-content-and-comms.md](./features/08-content-and-comms.md) |
| ヘルプ記事（HelpArticle） | 管理者がマークダウンで編集する、利用者向けの説明記事。公開記事はログイン不要で閲覧できる。 | [08-content-and-comms.md](./features/08-content-and-comms.md) |
| 問い合わせ（Inquiry） | 問い合わせフォームからの送信。単一の窓口を、カテゴリで使い分ける。 | [08-content-and-comms.md](./features/08-content-and-comms.md) |
| 問い合わせカテゴリ | 問い合わせの分類。`general`（一般）／`report`（通報）／`unfreeze`（解除リクエスト）。`report`・`unfreeze` は Trust & Safety のキューへ連携する。 | [08-content-and-comms.md](./features/08-content-and-comms.md) |
| 規約・ポリシー（Policy） | 利用規約・プライバシーポリシー。版（バージョン）管理し、過去版を保持する。 | [08-content-and-comms.md](./features/08-content-and-comms.md) |
| 版管理（バージョン管理） | 規約の各版に版番号・発効日・編集者を持たせ、新版を発効しても旧版を履歴として残す運用。 | [08-content-and-comms.md](./features/08-content-and-comms.md) |
| 発効 | 新しい版の規約を「公開中（有効）」に切り替えること。公開中の版は常に 1 つ。 | [08-content-and-comms.md](./features/08-content-and-comms.md) |
| 再同意 | 重要な改定を伴う新版の発効時に、利用者へ変更を通知し改めて同意を求めること。軽微な修正では求めない。 | [08-content-and-comms.md](./features/08-content-and-comms.md) |

---

## 10. ドキュメントの記法・進め方

仕様書（features/）を読み解くために必要な、本プロジェクト共通の記法・優先度の用語。

| 用語（英語・別名） | 意味 | 参照 |
| --- | --- | --- |
| SSoT（Single Source of Truth・単一の正本） | 仕様の「正本」のこと。本サービスでは [features/](./features/) がビジネスルール・受け入れ条件の SSoT であり、他ドキュメントと矛盾した場合は features/ を優先する。 | [features/README.md](./features/README.md) |
| エピック（EP-NN） | 関連するユーザーストーリーをまとめた機能群の単位（例: `EP-02 プロフィール編集`）。 | [04-user-stories.md](./overview/04-user-stories.md) |
| ユーザーストーリー（US-XXXX） | 「［ロール］として、［目的］したい。なぜなら［理由］だから」の形式で書く要望の単位（例: `US-0201`）。 | [04-user-stories.md](./overview/04-user-stories.md) |
| ビジネスルール（BR-AREA-NNN） | 機能が守るべき制約・規則を表す ID（例: `BR-PROF-001`）。 | [features/README.md](./features/README.md) |
| 受け入れ条件（AC-AREA-NNN） | 仕様を満たしたと判断する検証可能な条件を表す ID（例: `AC-ACCT-003`）。Given/When/Then 形式で書く。 | [features/README.md](./features/README.md) |
| 状態 ID（S-ENTITY-NAME） | エンティティの状態を表す ID（例: `S-USER-FROZEN`）。 | [features/README.md](./features/README.md) |
| AREA（領域区分） | ID に含まれる機能領域のコード。`COMMON`／`ACCT`／`PROF`／`SHARE`／`DISC`／`API`／`SAFE`／`ADMIN`／`CONTENT`。 | [features/README.md](./features/README.md) |
| Given/When/Then | 受け入れ条件の記法。前提（Given）・操作（When）・期待結果（Then）でシナリオを書き、テストへ直接対応づける。 | [features/README.md](./features/README.md) |
| MoSCoW（優先度） | 機能の優先度の区分。`Must`（核に直結する必須）／`Should`（価値を高めるが核ではない）／`Could`（あると望ましい補助）。 | [04-user-stories.md](./overview/04-user-stories.md) |
| トレーサビリティ（追跡性） | ユーザーストーリー（US）⇄ ビジネスルール（BR）⇄ 受け入れ条件（AC）を相互参照し、由来と影響を辿れるようにすること。 | [features/README.md](./features/README.md) |

---

## 関連ドキュメント

- サービス概要・コンセプト・ターゲット・ストーリー: [docs/service/overview/](./overview/)
- 機能仕様・受け入れ条件（正本 SSoT）: [docs/service/features/](./features/)
- 機能一覧（作業者向けの俯瞰）: [README.md](../../README.md)
- 用語の追加・修正は、対象を定義する features/ の更新と合わせて行い、両者を整合させること。
