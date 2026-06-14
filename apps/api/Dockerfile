# syntax=docker/dockerfile:1
# apps/api ローカル開発コンテナ — 内部 API（NestJS + Hono + Apollo Server / GraphQL, :55031）。
# ローカル開発専用。本番は Cloudflare Workers を用い、本イメージはデプロイしない
#   （docs/GUIDES/coding/03-docker.md §1 / docs/GUIDES/infra/00-overview.md §2・§4）。
# ソースはルート compose.yaml のバインドマウントで供給し、node_modules は名前付きボリュームで隔離する。
FROM node:26.3-trixie-slim

# 再現性のため pnpm のメジャーを固定する（docs/GUIDES/coding/03-docker.md §2）。
# 正確なバージョンに固定したい場合は build-arg で上書きする。
ARG PNPM_VERSION=11.6
RUN npm install -g pnpm@${PNPM_VERSION}

# 可能な範囲で非 root（node ユーザー）で実行する（docs/GUIDES/coding/03-docker.md §3）。
USER node
WORKDIR /workspace/apps/api
EXPOSE 55031

# 既定はワークスペースの dev スクリプト。compose 側で install→dev を実行する。
CMD ["pnpm", "dev"]
