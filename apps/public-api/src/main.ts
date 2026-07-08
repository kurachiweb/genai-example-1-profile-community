// 公開 REST API のローカル/dev用エントリポイント(Frameworks & Drivers)。
// 本番の Cloudflare Workers 向けエントリポイントは src/worker.ts。
// 共通の初期化ロジックは src/bootstrap.ts に集約する。
import { API_BASE_PATH, SWAGGER_PATH, createApp } from './bootstrap';

async function bootstrap(): Promise<void> {
	const { app, env } = await createApp();

	await app.listen(env.port, '0.0.0.0');
	const base = `http://0.0.0.0:${env.port}`;
	console.log(`[@app/public-api] 公開 REST API listening on ${base}/${API_BASE_PATH}`);
	console.log(`[@app/public-api] Swagger UI: ${base}/${SWAGGER_PATH}`);
}

void bootstrap();
