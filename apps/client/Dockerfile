# syntax=docker/dockerfile:1
# apps/client ローカル開発コンテナ — 利用者・閲覧者向け Web（Next.js / App Router, :48032）。
# ローカル開発専用。本番は Cloudflare Workers（OpenNext）を用い、本イメージはデプロイしない
#   （docs/GUIDES/coding/03-docker.md §1 / docs/GUIDES/infra/00-overview.md §2・§4）。
# ソースはルート compose.yaml のバインドマウントで供給し、node_modules は名前付きボリュームで隔離する。
# 共有フロントエンド（apps/frontend-lib）は /workspace/lib にマウントし、コンテナ内のミニ
# ワークスペース(apps/client/pnpm-workspace.yaml)で @app/frontend-lib を解決する。
FROM node:26.3-trixie-slim

# 再現性のため pnpm のメジャーを固定する（docs/GUIDES/coding/03-docker.md §2）。
# 正確なバージョンに固定したい場合は build-arg で上書きする。
ARG PNPM_VERSION=11.8
RUN npm install -g pnpm@${PNPM_VERSION}

# node_modules は名前付きボリュームで隔離する。アプリ本体(/workspace/node_modules)に加え、
# frontend-lib メンバー(/workspace/lib/node_modules)も専用ボリュームになるため両方を用意する。
# 空ボリュームはマウント先の所有権を引き継ぐので、非 root 切替の前に node 所有で作成し、
# node ユーザーの pnpm install が書き込めるようにする(EACCES 回避)。
RUN mkdir -p /workspace/node_modules /workspace/lib/node_modules \
	&& chown -R node:node /workspace

# 可能な範囲で非 root（node ユーザー）で実行する（docs/GUIDES/coding/03-docker.md §3）。
USER node
# apps/client を /workspace へ単体マウントする（compose.yaml）。WORKDIR も /workspace に合わせる。
WORKDIR /workspace

# pnpm パッケージ依存解決に必要なマニフェストのみコピーし、パッケージをインストールする。
# 共有フロントエンド(apps/frontend-lib)は lib メンバーとして解決するため、その package.json を
# /workspace/lib にも配置する（実体は実行時にバインドマウントで供給される）。
# ソース本体は実行時に compose のバインドマウントで供給するためコピーしない。
COPY --chown=node:node apps/client/package.json apps/client/pnpm-lock.yaml apps/client/pnpm-workspace.yaml ./
COPY --chown=node:node apps/frontend-lib/package.json ./lib/package.json
RUN pnpm install

EXPOSE 48032

# 既定コマンド、compose 側で上書き可能。
CMD ["sleep", "infinity"]
