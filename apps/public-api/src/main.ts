// 公開 REST API のエントリポイント(Frameworks & Drivers)。
// ローカル開発は @nestjs/platform-express で起動する。本番の Hono/Workers アダプタは後続ユニット
// (coding/04-nestjs.md §7)。ランタイム差は本層に閉じ込め、Entities/Use Cases に持ち込まない。
import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';
import { buildValidationPipe } from './interface/rest/validation';

// ベースパス(features/05-public-api.md §3)。Swagger UI は本プレフィックスの外側に置く。
const API_BASE_PATH = 'api/public/v1';
const SWAGGER_PATH = 'docs';

async function bootstrap(): Promise<void> {
	// 必須環境変数を起動時に検証(欠落時はここで失敗)。
	const env = loadEnv();

	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix(API_BASE_PATH);
	app.useGlobalPipes(buildValidationPipe());
	app.enableShutdownHooks();

	// CORS: API キー(Bearer)前提で Cookie を使わないため、必要最小限のメソッド/ヘッダに限る(api/02 §6)。
	// 許可オリジンの本番方針は横断方針(security/02 §7)に従う。ローカルは Bearer 認証のため全許可・資格情報なし。
	app.enableCors({
		origin: true,
		credentials: false,
		methods: ['GET', 'PUT', 'PATCH', 'DELETE'],
		allowedHeaders: ['Authorization', 'Content-Type']
	});

	// OpenAPI / Swagger UI(BR-API-012)。業務具体値は転記せず features/ を参照させる(api/02 §9)。
	const openApiConfig = new DocumentBuilder()
		.setTitle('GenAI Profile Community 公開 API')
		.setDescription(
			'プロフィール共有サービスの公開 REST API。認証は API キー(Authorization: Bearer)。' +
				'エンドポイント・スコープ・しきい値・エラーコードの正本は docs/service/features/05-public-api.md。'
		)
		.setVersion('v1')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, openApiConfig);
	SwaggerModule.setup(SWAGGER_PATH, app, document);

	// ローカル/dev はスキーマを自動同期して即起動できるようにする。
	// 本番(D1)は wrangler マイグレーションで適用し、AI/アプリは実行しない(CLAUDE.md)。
	if (env.autoSyncSchema) {
		const orm = app.get(MikroORM);
		await orm.schema.update();
	}

	await app.listen(env.port, '0.0.0.0');
	const base = `http://0.0.0.0:${env.port}`;
	console.log(`[@app/public-api] 公開 REST API listening on ${base}/${API_BASE_PATH}`);
	console.log(`[@app/public-api] Swagger UI: ${base}/${SWAGGER_PATH}`);
}

void bootstrap();
