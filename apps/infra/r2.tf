// アイコン画像の原本ストレージ（BR-PROF-001）。配信・正規化は Cloudflare Images が担う
// （Cloudflare Images 自体はアカウント側で有効化する製品でありTerraformリソースを持たない）。
resource "cloudflare_r2_bucket" "icons" {
  account_id = var.cloudflare_account_id
  name       = "genai-example-1-icons-${terraform.workspace}"
  location   = var.r2_location
}

// Next.js(client/admin)の OpenNext ISR/Data Cache バックエンド(@opennextjs/cloudflare の
// R2IncrementalCache、ADR 20260708)。client/admin は別Worker・別デプロイのためバケットも分離する。
resource "cloudflare_r2_bucket" "client_cache" {
  account_id = var.cloudflare_account_id
  name       = "genai-example-1-client-cache-${terraform.workspace}"
  location   = var.r2_location
}

resource "cloudflare_r2_bucket" "admin_cache" {
  account_id = var.cloudflare_account_id
  name       = "genai-example-1-admin-cache-${terraform.workspace}"
  location   = var.r2_location
}
