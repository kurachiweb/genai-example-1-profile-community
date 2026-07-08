output "d1_database_id" {
  description = "wrangler.jsonc の d1_databases[].database_id に設定する値"
  value       = cloudflare_d1_database.app.id
}

output "d1_database_name" {
  value = cloudflare_d1_database.app.name
}

output "kv_namespace_session_client_id" {
  value = cloudflare_workers_kv_namespace.session_client.id
}

output "kv_namespace_session_admin_id" {
  value = cloudflare_workers_kv_namespace.session_admin.id
}

output "kv_namespace_app_id" {
  value = cloudflare_workers_kv_namespace.app.id
}

output "r2_bucket_icons_name" {
  value = cloudflare_r2_bucket.icons.name
}

output "r2_bucket_client_cache_name" {
  value = cloudflare_r2_bucket.client_cache.name
}

output "r2_bucket_admin_cache_name" {
  value = cloudflare_r2_bucket.admin_cache.name
}
