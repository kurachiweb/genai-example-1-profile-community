# コードマップ — `apps/admin`（管理者コンソール）と `apps/api` 管理者バックエンド

運営チーム向け管理者コンソール（ユニット `admin-console`）の構造マップ。
仕様の正本は [features/07-admin-console.md](../service/features/07-admin-console.md)・[features/00-common-rules.md](../service/features/00-common-rules.md)、認可は [GUIDES/security/01-authn-authz.md](../GUIDES/security/01-authn-authz.md)。

## アーキテクチャ（BFF）

ブラウザは admin（Next.js）にのみアクセスし、admin サーバーが内部 GraphQL（`apps/api`）を呼ぶ BFF 構成。
セッション ID は **HttpOnly Cookie**（本番 `__Host-` + Secure）に保持し、サーバー側だけが読んでヘッダ `x-admin-session` で api へ転送する。api は Cookie を用いないため CSRF 面を構造的に縮小し、Cookie を持つ admin 側は **Server Action の同一オリジン検証＋ SameSite** で CSRF を防ぐ。

```text
ブラウザ ──(HttpOnly Cookie)── admin(Next.js BFF) ──(x-admin-session)── api(GraphQL)
```

## `apps/admin/`（Next.js 16 / App Router）

```text
apps/admin/
├── app/
│   ├── layout.tsx                  # ルート(テーマ FOUC 防止・ThemeProvider・noindex)
│   ├── login/                      # ログイン(Bento・メール+パスワード/パスキー)
│   ├── (console)/                  # 認証済みシェル(左固定サイドバー+上部バー)。requireAdmin で保護
│   │   ├── page.tsx                # ダッシュボード(統計タイル+要対応キュー)
│   │   ├── users/                  # 一覧/検索/ページング(URL状態) → [id] 詳細+モデレーション
│   │   ├── reports/                # 通報の審査・処分
│   │   ├── unfreeze-requests/      # 解除リクエスト審査
│   │   ├── api-keys/               # API キー運用(メタ閲覧/失効)+共通レート制限変更
│   │   ├── audit-logs/             # 監査ログ閲覧(追記専用・絞り込み/ページング)
│   │   ├── admins/                 # 管理者・権限管理(super_admin)
│   │   ├── announcements/          # §08 お知らせ(作成/編集/公開)
│   │   ├── email/                  # §08 メール通知(下書き/テスト送信/配信)
│   │   ├── help/                   # §08 ヘルプ記事(作成/編集/公開切替)
│   │   ├── inquiries/              # §08 問い合わせ対応(状態管理・キュー連携)
│   │   ├── policies/               # §08 規約・ポリシー版管理(super_admin)
│   │   └── settings/passkeys/      # パスキー登録/一覧/削除
│   ├── api/passkey/                # WebAuthn の BFF ルートハンドラ(register/auth × start/finish)
│   └── logout/            # 失効 Cookie 回収ルート。Cookie 破棄→/login。リダイレクトループ防止
├── proxy.ts                        # 認証ガード(UX 補助。実認可は api)
└── src/
    ├── lib/api/                    # サーバー側 GraphQL クライアント・型・操作ラッパー
    ├── lib/auth/                   # セッション Cookie・ログイン/ログアウト Server Action・requireAdmin
    ├── lib/actions.ts              # 変更操作 Server Action(api 呼び出し+revalidate)
    ├── lib/webauthn/client.ts      # @simplewebauthn/browser の orchestration
    ├── lib/i18n/labels.ts          # ロール/状態/イベントの日本語ラベル・状態→トーン
    └── components/                 # shell(Sidebar/Topbar/ThemeToggle)・ui(Table/ConfirmDialog/...)・moderation・ops・admins・security
```

- **データ取得**: RSC（Server Component）で並列フェッチ（ウォーターフォール回避）。**変更**: Server Action → api → `revalidatePath`。
- **重要操作**: 確認ダイアログ（ネイティブ `<dialog>`）＋「監査ログに記録されます」明示（`AC-ADMIN-001`〜`013`・design/03 §10）。
- **共有資産**: トークン・プリミティブ・テーマ・ユーティリティは `@app/frontend-lib`（[frontend-lib コードマップ](./frontend-lib.md)）。
- **失効セッションの回収**: `proxy.ts` は Cookie の有無だけで判定するため、api 側でセッションが消えた（例: 開発中の api 再起動でインプロセスセッションが揮発）状態で Cookie が残ると `/` ⇄ `/login` の無限リダイレクト（`ERR_TOO_MANY_REDIRECTS`）になる。`requireAdmin` は `UNAUTHORIZED` 時に `/logout` へ送り、そこで Cookie を破棄してから `/login` へ抜けることでループを断つ（Cookie 変更は Route Handler でのみ可能）。

## `apps/api` 管理者バックエンド（クリーンアーキテクチャ）

```text
apps/api/src/
├── domain/                         # admin-role(RBAC)/admin-account(ロックアウト防止)/audit-event/
│                                   #   moderation(状態遷移)/rate-limit/admin-credentials/admin-limits/
│                                   #   content(§08 状態遷移/スラッグ/タイトル)/email-templates
├── application/admin/              # ユースケース: auth/webauthn/admin-account/user-admin/moderation/
│                                   #   api-key-admin/stats/audit-log + §08(announcement/help-article/
│                                   #   policy/inquiry/email-notification) + gateways + audit-recorder + fakes
├── infrastructure/                 # Argon2id(password-hasher)・セッション/チャレンジストア(KV相当)・
│   │                               #   WebAuthn 検証(@simplewebauthn)・mail-sender(nodemailer→Mailpit)・
│   │                               #   各 MikroORM リポジトリ・seed-admin
│   └── persistence/entities/       # admin_accounts/admin_webauthn_credentials/audit_logs/suspensions/
│                                   #   unfreeze_requests/reports/api_keys/app_settings/
│                                   #   announcements/email_notifications/help_articles/inquiries/policies
└── interface/graphql/admin/        # 型・入力・admin-context(セッションヘッダ解決)・resolver・
                                    #   content-types/content-inputs/content.resolver・module
```

- **認可の集約**: RBAC（`assertCan`）・ロックアウト防止・状態遷移整合はユースケース/ドメインに集約し、UI 非表示だけに頼らず api で 403/422 を返す（`AC-ADMIN-001`）。
- **監査**: すべての変更操作は `AuditRecorder` を通して追記（秘匿値除去済み、`BR-COMMON-013/014`）。
- **本番との差**: セッション/チャレンジはローカルでインプロセス（KV 相当）。本番は Cloudflare KV 実装へ Gateway で差し替える。Argon2id（`@node-rs/argon2`）は Workers では WASM/WebCrypto 実装へ差し替える。

## 初期化・テスト

- 初期スーパー管理者: `pnpm --filter @app/api seed:admin`（`ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` で上書き可）。
- テスト: `apps/api` の管理者ドメイン/ユースケース単体＋ GraphQL 統合（`test/graphql-admin.spec.ts`）、`apps/admin` の RBAC ナビ/ラベル等。

## 本番化に向けた差し替え（後続）

- セッション/WebAuthn チャレンジ/レート制限カウンタを Cloudflare KV/DO 実装へ（現在はインプロセス）。
- `MailSender` を Amazon SES＋MJML（`@faire/mjml-react`）へ（現在は nodemailer→Mailpit、簡易 HTML）。
- Argon2id を Workers 互換実装（WASM/WebCrypto）へ。
- マークダウン本文の公開面サニタイズ（client 側レンダリング、`AC-CONTENT-002`）。問い合わせ送信フォーム（client・ハニーポット/レート制限、`BR-CONTENT-006`）。
