// KV 名前空間は用途別に 3 つを分離する（docs/GUIDES/infra/01-network-architecture.md §4）。
// - session_client / session_admin: 利用者・管理者セッションを Cookie・ドメイン・ストアの
//   全てで分離する（BR-COMMON-002）ため、物理的にも別名前空間とする。
// - app: メール確認・パスワードリセット・メール変更・WebAuthn チャレンジ等のワンタイム
//   トークン、検索/一覧の短TTLキャッシュ、認証系・通報系のレート制限カウンタ（近似）を格納する。
//   公開APIのキー単位レート制限カウンタは KV ではなく Durable Objects（Worker 側で宣言）。
resource "cloudflare_workers_kv_namespace" "session_client" {
  account_id = var.cloudflare_account_id
  title      = "genai-profile-community-session-client-${terraform.workspace}"
}

resource "cloudflare_workers_kv_namespace" "session_admin" {
  account_id = var.cloudflare_account_id
  title      = "genai-profile-community-session-admin-${terraform.workspace}"
}

resource "cloudflare_workers_kv_namespace" "app" {
  account_id = var.cloudflare_account_id
  title      = "genai-profile-community-app-${terraform.workspace}"
}
