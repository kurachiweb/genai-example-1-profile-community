// Cloudflare リソース（D1・KV・R2）を管理する Terraform 構成のエントリポイント。
// Worker スクリプト自体（コード）は Terraform では管理しない。GitHub Actions から
// `wrangler deploy` で直接デプロイする（同一リソースを Terraform と wrangler の双方で
// 管理すると "409 Conflict on worker deployment" が発生するため）。
//
// 環境分離は Terraform workspace（dev / production）を用いる。
// `terraform workspace select dev` などで切り替えたうえで plan/apply する。
//
// state バックエンド（R2, S3 互換）は account_id 等の環境固有値を含むため、
// このファイルではキー・リージョン等の共通設定のみを宣言し、認証情報とエンドポイントは
// `terraform init -backend-config=...` で分離して渡す（README.md 参照）。
terraform {
  required_version = ">= 1.9"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.15"
    }
  }

  backend "s3" {
    bucket                      = "terraform-state"
    key                         = "genai-profile-community/cloudflare.tfstate"
    region                      = "auto"
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_s3_checksum            = true
    use_path_style              = true
  }
}

// api_token は CLOUDFLARE_API_TOKEN 環境変数から自動的に読み込まれる（ハードコード禁止）。
provider "cloudflare" {}
