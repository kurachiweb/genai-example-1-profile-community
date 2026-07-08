// Next.js 設定。共通ライブラリ(@app/frontend-lib)を TS ソースのままトランスパイルする。
// 本番は Cloudflare Workers(OpenNext)。本設定はローカル/dev と OpenNext の双方で機能する。
import { resolve } from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
	// 共有フロントエンド(lib)をパッケージとして取り込み、Next がコンパイルする。
	transpilePackages: ['@app/frontend-lib'],
	// 型エラーはビルドを止める(品質ゲート)。lint は専用スクリプト/CI で実行する。
	typescript: { ignoreBuildErrors: false },
	// pnpmのホイスティングにより next 本体がモノレポルートの node_modules/.pnpm に
	// 配置されることがあり(アプリごとに異なりうる、実機で確認済み)、Turbopackの
	// ワークスペースルート自動推定がプロジェクトディレクトリ配下に next を見つけられず
	// 誤作動する。next が実際にどこへ解決されても含まれるよう、モノレポルート
	// (このファイルの2階層上)を明示的にルートとして指定する。
	// ただし @opennextjs/cloudflare 経由のビルドは NEXT_PRIVATE_OUTPUT_TRACE_ROOT を
	// apps/admin 自身に設定しており(apps/admin/pnpm-lock.yaml をアプリ単体の
	// モノレポルートとして検出するため)、turbopack.root と outputFileTracingRoot が
	// 食い違うと Next がエラーにする。その場合はOpenNext側の値に合わせる。
	turbopack: {
		root: process.env.NEXT_PRIVATE_OUTPUT_TRACE_ROOT ?? resolve(process.cwd(), '../..')
	}
};

export default config;
