# syntax=docker/dockerfile:1
# apps/public-api ローカル開発コンテナ — 公開 API（NestJS + Hono / REST, :48034）。
# ローカル開発専用。本番は Cloudflare Workers を用い、本イメージはデプロイしない
#   （docs/GUIDES/coding/03-docker.md §1 / docs/GUIDES/infra/00-overview.md §2・§4）。
# ソースはルート compose.yaml のバインドマウントで供給し、node_modules は名前付きボリュームで隔離する。
FROM node:26.3-trixie-slim

# 再現性のため pnpm のメジャーを固定する（docs/GUIDES/coding/03-docker.md §2）。
# 正確なバージョンに固定したい場合は build-arg で上書きする。
ARG PNPM_VERSION=11.8
RUN npm install -g pnpm@${PNPM_VERSION}

# node_modules は名前付きボリューム(public_api_node_modules)で隔離する。空ボリュームは
# マウント先ディレクトリの所有権を引き継ぐため、非 root 切替の前に node 所有で用意する。
# また pnpm install は /workspace 直下にも一時ファイルを書き出すため、/workspace 全体を
# node 所有にしてビルド時インストールの EACCES を回避する。
RUN mkdir -p /workspace/node_modules && chown -R node:node /workspace

# 可能な範囲で非 root（node ユーザー）で実行する（docs/GUIDES/coding/03-docker.md §3）。
USER node
# apps/public-api を /workspace へ単体マウントする（compose.yaml）。WORKDIR も /workspace に合わせる。
WORKDIR /workspace

# pnpm パッケージ依存解決に必要なマニフェストのみコピーし、パッケージをインストールする。
# ソース本体は実行時に compose のバインドマウントで供給するためコピーしない。
COPY --chown=node:node apps/public-api/package.json apps/public-api/pnpm-lock.yaml apps/public-api/pnpm-workspace.yaml ./
RUN pnpm install

EXPOSE 48034

# 既定コマンド、compose 側で上書き可能。
CMD ["sleep", "infinity"]
