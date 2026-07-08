// アイコン画像の原本ストレージ（BR-PROF-001）。配信・正規化は Cloudflare Images が担う
// （Cloudflare Images 自体はアカウント側で有効化する製品でありTerraformリソースを持たない）。
resource "cloudflare_r2_bucket" "icons" {
  account_id = var.cloudflare_account_id
  name       = "genai-example-1-icons-${terraform.workspace}"
  location   = var.r2_location
}
