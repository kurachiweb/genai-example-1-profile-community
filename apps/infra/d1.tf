// ドメインデータの正本（users/profiles/sns_links/api_keys 等）。
// apps/api と apps/public-api の両 Worker が同一の D1 データベースを binding で共有する。
// スキーマ（テーブル定義）自体は Terraform ではなく wrangler d1 migrations で管理する
// （docs/GUIDES/db/02-migrations.md）。
resource "cloudflare_d1_database" "app" {
  account_id = var.cloudflare_account_id
  name       = "genai-example-1-${terraform.workspace}"

  // read_replication を明示しないと、API 側が既定値(disabled)を返すのに対し
  // Terraform が「未設定 = null」を desired state とみなし、次回 apply で
  // "Invalid property: read_replication => Expected object, received null" エラーになる
  // (cloudflare/cloudflare ~> 5.15 の既知の挙動)。明示することで差分を発生させない。
  read_replication = {
    mode = "disabled"
  }
}
