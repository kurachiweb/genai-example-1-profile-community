// ドメインデータの正本（users/profiles/sns_links/api_keys 等）。
// apps/api と apps/public-api の両 Worker が同一の D1 データベースを binding で共有する。
// スキーマ（テーブル定義）自体は Terraform ではなく wrangler d1 migrations で管理する
// （docs/GUIDES/db/02-migrations.md）。
resource "cloudflare_d1_database" "app" {
  account_id = var.cloudflare_account_id
  name       = "genai-profile-community-${terraform.workspace}"
}
