# syntax=docker/dockerfile:1
# ルートツールチェーンコンテナ（ローカル開発専用）。
# 役割: npm パッケージ等をグローバルインストールした共通ツールコンテナ。
#   pnpm / Terraform / wrangler / git を備え、compose から exec して各種コマンドを実行する
#   （CLAUDE.md ディレクトリ構成 / docs/GUIDES/coding/03-docker.md §1）。
# 本番ランタイムは Cloudflare Workers（サーバーレス）であり、本イメージはデプロイしない。
FROM node:26.3-trixie-slim

# 再現性のためツールのバージョンを固定する（docs/GUIDES/coding/03-docker.md §2）。
# 正確なバージョンに固定したい場合は build-arg で上書きする。
ARG PNPM_VERSION=11.6
ARG WRANGLER_VERSION=4
ARG TERRAFORM_VERSION=1.15.6
# buildx が自動付与するターゲットアーキテクチャ（amd64 / arm64）。
ARG TARGETARCH

# git と、Terraform 取得に必要な CLI を一度の apt 実行でまとめて導入する（apt-get update のレイヤを共有）。
# git は Debian の標準パッケージで apt 一行で済むため、専用処理を設けずここで導入する。常用ツールのため削除しない。
# Terraform は npm 外の単一バイナリのため、固定バージョンの公式リリースを取得して配置する。
# unzip は Terraform の展開にのみ必要なため、取得後に削除してレイヤを小さく保つ。
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git unzip \
  && curl -fsSL -o /tmp/terraform.zip \
     "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_${TARGETARCH}.zip" \
  && unzip -o /tmp/terraform.zip -d /usr/local/bin \
  && rm /tmp/terraform.zip \
  && apt-get purge -y --auto-remove unzip \
  && rm -rf /var/lib/apt/lists/*

# pnpm / wrangler をグローバルインストールする（バージョン固定）。
RUN npm install -g pnpm@${PNPM_VERSION} wrangler@${WRANGLER_VERSION}

# node_modules は名前付きボリューム(root_node_modules)で隔離する。空ボリュームは
# マウント先ディレクトリの所有権を引き継ぐため、非 root 切替の前に node 所有で用意し、
# node ユーザーの pnpm install が書き込めるようにする(EACCES 回避)。
RUN mkdir -p /workspace/node_modules && chown node:node /workspace/node_modules

# 可能な範囲で非 root（node ユーザー）で実行する（docs/GUIDES/coding/03-docker.md §3）。
USER node
WORKDIR /workspace

# 常駐ツールコンテナ。`docker compose exec root <cmd>` で pnpm/terraform/wrangler/git を使う。
CMD ["sleep", "infinity"]
