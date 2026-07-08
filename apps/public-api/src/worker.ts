// 公開 REST API の Cloudflare Workers エントリポイント(Frameworks & Drivers)。
// Cloudflare公式のExpress-on-Workersサポート(cloudflare:node の httpServerHandler)を用い、
// NestJS(@nestjs/platform-express)をそのまま Workers ランタイム上で動かす(coding/04-nestjs.md §7、
// apps/api/src/worker.ts と同一パターン)。
// nodejs_compat フラグ + compatibility_date > 2025-08-15 が必須(wrangler.jsonc)。
import { httpServerHandler } from 'cloudflare:node';
import { env } from 'cloudflare:workers';
import { ApiKeyRateLimiterDurableObject } from './infrastructure/rate-limit/api-key-rate-limiter.do';

const PORT = 8080;

// wrangler.jsonc の durable_objects.bindings.class_name が本エントリモジュールから直接
// export されたクラスを参照する必要があるため、ここで再エクスポートする(NestJS/decorator
// 非依存のためesbuildバンドルに問題は無く、dist経由にする必要もない、ADR 20260604)。
export { ApiKeyRateLimiterDurableObject };

// `../dist/`(nest build で tsc 経由でコンパイル済みの JS)を直接 import する。
// esbuild(wranglerのバンドラ)は emitDecoratorMetadata に対応しておらず、NestJS の暗黙的な
// 型ベース DI(design:paramtypes)に必要なメタデータを生成できないため、素の src/*.ts を
// バンドルさせると依存解決が壊れる(既知の esbuild の制約、apps/api と同一事情)。事前に
// `pnpm build` で正しくメタデータ付与済みの JS を生成し、それを参照することで esbuild に
// デコレータを一切処理させない。workers-runtime も必ず dist 側から import すること
// (src 側を esbuild が別途バンドルするとモジュール状態が二重化し、ここで登録した D1
// バインディングが AppModule 側から見えなくなる)。
// 型は `typeof import('./...')` で src 側の型定義を参照する(実行時の import 先とは別)。
let bootstrapped: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
	const { setD1Database, setRateLimiterNamespace } =
		(await import('../dist/infrastructure/workers-runtime.js')) as typeof import('./infrastructure/workers-runtime');
	// env(D1・DOバインディング)はリクエストハンドラの引数から取得する。
	// wrangler.jsonc の env.dev/env.production 双方に必須設定しているため実運用では必ず存在するが、
	// 生成される Env 型は環境間で異なりうる汎用形(各フィールド任意)になるため明示的に検証する。
	if (!env.DB || !env.API_KEY_RATE_LIMITER) {
		throw new Error('D1/Durable Objects のバインディングが未設定です(wrangler.jsonc を確認してください)。');
	}
	// AppModule/ProfileModuleの各forRootAsync/useFactoryがこの登録を見て
	// D1接続・DOバックエンドのレート制限に切り替える(ADR 20260604)。
	setD1Database(env.DB);
	setRateLimiterNamespace(env.API_KEY_RATE_LIMITER);
	const { createApp } = (await import('../dist/bootstrap.js')) as typeof import('./bootstrap');
	const { app } = await createApp();
	await app.listen(PORT);
}

function ensureBootstrapped(): Promise<void> {
	bootstrapped ??= bootstrap();
	return bootstrapped;
}

const server = httpServerHandler({ port: PORT });

export default {
	async fetch(request, env, ctx) {
		await ensureBootstrapped();
		if (!server.fetch) {
			throw new Error('Express-on-Workers ハンドラの初期化に失敗しました。');
		}
		return server.fetch(request, env, ctx);
	}
} satisfies ExportedHandler<Env>;
