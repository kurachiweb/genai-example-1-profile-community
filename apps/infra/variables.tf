variable "cloudflare_account_id" {
  description = "Cloudflare アカウント ID（.env / GitHub Environment secrets の CLOUDFLARE_ACCOUNT_ID と同じ値）"
  type        = string
}

variable "r2_location" {
  description = "R2 バケットのロケーションヒント（大文字固定。cloudflare_r2_bucket の既知の不具合対策）"
  type        = string
  default     = "WNAM"
}

// ゾーン（本番ドメイン）確定後に有効化する。未確定の間は null のままとし、
// カスタムドメイン・WAF Rate Limiting Rules 等ゾーン依存リソースは作成しない。
variable "zone_id" {
  description = "本番ドメインの Cloudflare ゾーン ID（未確定の間は null）"
  type        = string
  default     = null
}
