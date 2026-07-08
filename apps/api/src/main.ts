// 内部 GraphQL API のローカル/dev 用エントリポイント(Frameworks & Drivers)。
// 本番(Cloudflare Workers)は worker.ts(Express-on-Workers、coding/04-nestjs.md §7)。
// 共通の初期化ロジックは bootstrap.ts に集約する。
import { createApp } from './bootstrap';

async function main(): Promise<void> {
	const { app, env } = await createApp();
	await app.listen(env.port, '0.0.0.0');
	console.log(`[@app/api] 内部 GraphQL API listening on http://0.0.0.0:${env.port}/graphql`);
}

void main();
