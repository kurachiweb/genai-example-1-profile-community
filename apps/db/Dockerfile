# syntax=docker/dockerfile:1
# apps/db ローカル開発コンテナ — DB スキーマ定義・マイグレーション（SQLite / MikroORM, :48030）。
# ローカル開発専用。本番は Cloudflare D1 を用い、本イメージはデプロイしない
#   （docs/GUIDES/coding/03-docker.md §1 / docs/GUIDES/infra/00-overview.md §4）。
# ソースはルート compose.yaml のバインドマウントで供給し、node_modules は名前付きボリュームで隔離する。
FROM node:26.3-trixie-slim

# 再現性のため pnpm のメジャーを固定する（docs/GUIDES/coding/03-docker.md §2）。
# 正確なバージョンに固定したい場合は build-arg で上書きする。
ARG PNPM_VERSION=11.8
RUN npm install -g pnpm@${PNPM_VERSION}

# node_modules は名前付きボリューム(root_node_modules)で隔離する。空ボリュームは
# マウント先ディレクトリの所有権を引き継ぐため、非 root 切替の前に node 所有で用意し、
# node ユーザーの pnpm install が書き込めるようにする(EACCES 回避)。
RUN mkdir -p /workspace/node_modules && chown node:node /workspace/node_modules

# SQLite 実体を格納する db_data ボリュームの共有マウント先。db は api/public-api より
# 先に起動する(両者は depends_on で db の healthy を待つ)ため、空ボリュームは本イメージの
# /workspace/.db-data の所有権で初期化される。api/public-api(node ユーザー)が SQLite を
# 生成・書き込みできるよう、node 所有で用意する(EACCES 回避)。
RUN mkdir -p /workspace/.db-data && chown node:node /workspace/.db-data

# 可能な範囲で非 root（node ユーザー）で実行する（docs/GUIDES/coding/03-docker.md §3）。
USER node
# apps/db を /workspace へ単体マウントする（compose.yaml）。WORKDIR も /workspace に合わせる。
WORKDIR /workspace
EXPOSE 48030

# 既定はこのアプリの dev スクリプト。compose 側で install→dev を実行する。
CMD ["pnpm", "dev"]
