// Next.js 設定。共通ライブラリ(@app/frontend-lib)を TS ソースのままトランスパイルする。
// 本番は Cloudflare Workers(OpenNext)。本設定はローカル/dev と OpenNext の双方で機能する。
import type { NextConfig } from 'next';

const config: NextConfig = {
	// 共有フロントエンド(lib)をパッケージとして取り込み、Next がコンパイルする。
	transpilePackages: ['@app/frontend-lib'],
	// 型エラーはビルドを止める(品質ゲート)。lint は専用スクリプト/CI で実行する。
	typescript: { ignoreBuildErrors: false },
	images: {
		// Cloudflare Images のドメインを許可。ローカル開発ではプレースホルダを使う。
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'imagedelivery.net'
			}
		]
	}
};

export default config;
