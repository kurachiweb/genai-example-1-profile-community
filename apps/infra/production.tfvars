// cloudflare_account_id は TF_VAR_cloudflare_account_id 環境変数（CLOUDFLARE_ACCOUNT_ID と同値）
// から供給する想定のため、ここでは意図的に指定しない（README.md 参照）。
//
// 本番ドメイン確定後、ここに zone_id を追記し、カスタムドメイン・WAF Rate Limiting Rules 用の
// モジュール／リソースを別途追加する。
// zone_id = "..."
