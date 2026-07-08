# apps/infra — Terraform（Cloudflare リソース管理）

`apps/infra` は Cloudflare 上のリソース（D1・KV・R2）を Terraform で管理する。Worker スクリプト本体（コード）
はここでは管理せず、GitHub Actions から `wrangler deploy` で直接デプロイする（`docs/GUIDES/infra/02-deployment.md` 参照）。

## 前提

- `docker compose exec root` 経由で `terraform` コマンドを実行する（ルート `Dockerfile` に固定バージョンでインストール済み）。
- 認証情報はすべて環境変数から供給し、コードにハードコードしない。

| 変数 | 用途 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | provider 認証（Terraform が自動で読む） |
| `TF_VAR_cloudflare_account_id` | `variables.tf` の `cloudflare_account_id`（`CLOUDFLARE_ACCOUNT_ID` と同値を設定する） |
| `CLOUDFLARE_S3_ACCESS_KEY_ID` / `CLOUDFLARE_S3_SECRET_ACCESS_KEY` | state バックエンド（R2, S3 互換）の認証情報 |
| `CLOUDFLARE_S3_API_ENDPOINT` | state バックエンドのエンドポイント（アカウント固有のため `-backend-config` で分離）|

## 初回セットアップ（bootstrap）

state を保存する R2 バケット自体は Terraform 管理外で一度だけ作成する（鶏卵問題）。

```bash
docker compose exec root wrangler r2 bucket create terraform-state
```

## init（初回・バックエンド設定変更時）

アカウント固有の値（認証情報・エンドポイント）は `-backend-config` で分離して渡す（`main.tf` にはハードコードしない）。

```bash
docker compose exec root sh -c '
  cd apps/infra && terraform init \
    -backend-config="access_key=$CLOUDFLARE_S3_ACCESS_KEY_ID" \
    -backend-config="secret_key=$CLOUDFLARE_S3_SECRET_ACCESS_KEY" \
    -backend-config="endpoints={s3=\"$CLOUDFLARE_S3_API_ENDPOINT\"}"
'
```

## 環境切り替え（workspace）

環境分離は Terraform workspace（`dev` / `production`）を用いる。wrangler 側の `--env dev` / `--env production` と名称を揃えている。

```bash
docker compose exec root sh -c 'cd apps/infra && terraform workspace new dev'
docker compose exec root sh -c 'cd apps/infra && terraform workspace new production'

# 切り替え
docker compose exec root sh -c 'cd apps/infra && terraform workspace select dev'
```

## plan / apply

```bash
docker compose exec root sh -c '
  cd apps/infra && TF_VAR_cloudflare_account_id="$CLOUDFLARE_ACCOUNT_ID" \
  terraform plan -var-file=dev.tfvars
'
# 内容を確認したうえで apply
docker compose exec root sh -c '
  cd apps/infra && TF_VAR_cloudflare_account_id="$CLOUDFLARE_ACCOUNT_ID" \
  terraform apply -var-file=dev.tfvars
'
```

`production` ワークスペースへの apply は、GitHub Actions の prod デプロイワークフロー内で
Required reviewers による人間の承認を経てから実行する運用とする（AI エージェントは prod への
apply を実行しない）。

## 出力の使い方

`terraform output` で得られる ID を各アプリの `wrangler.jsonc` の bindings（`d1_databases[].database_id`・
`kv_namespaces[].id`）に設定する。GitHub Actions のデプロイワークフローでは `terraform output -raw <name>` を
使い、`wrangler.jsonc` を実行時に差し込む（Terraform と wrangler で同一リソースの二重管理をしないため）。

## Terraform が管理しないもの

- Worker スクリプト本体のデプロイ（`wrangler deploy` が担当。同一リソースを Terraform と wrangler の
  双方で管理すると `409 Conflict on worker deployment` になるため併用しない）。
- Cloudflare Images の有効化（アカウント側でダッシュボードから手動で行う。Terraform リソースが存在しない）。
- カスタムドメイン・DNS・WAF Rate Limiting Rules（本番ドメインが未確定のため今回は対象外。
  ドメイン確定後、`variables.tf` の `zone_id` を設定し、ゾーン依存リソース用のファイルを追加する）。
- Durable Objects の namespace（各 Worker の `wrangler.jsonc` 内で宣言し、`wrangler deploy` 時に
  migration が自動適用される）。

## 関連ドキュメント

- デプロイ全体方針: [docs/GUIDES/infra/02-deployment.md](../../docs/GUIDES/infra/02-deployment.md)
- インフラ概要: [docs/GUIDES/infra/00-overview.md](../../docs/GUIDES/infra/00-overview.md)
