// NestJS アプリケーションの共通初期化(Frameworks & Drivers)。
// ローカル/dev(main.ts)と Cloudflare Workers(worker.ts)の両エントリポイントから呼ばれる。
import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { loadEnv, type AppEnv } from './config/env';
import { buildSwaggerDocsHtml } from './infrastructure/swagger-docs-page';
import { buildValidationPipe } from './interface/rest/validation';

// ベースパス(features/05-public-api.md §3)。Swagger UI は本プレフィックスの外側に置く。
export const API_BASE_PATH = 'api/public/v1';
export const SWAGGER_PATH = 'docs';

export async function createApp(): Promise<{ app: INestApplication; env: AppEnv }> {
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
	// 標準UIサーブ(swagger-ui-distをディスクから直接読む実装)はファイルシステムを持たない
	// Cloudflare Workersで動作しないため無効化し、JSON仕様(/docs-json)のみ標準機能で公開する。
	// UI自体はCDN(jsdelivr)からswagger-ui-distを読み込む自前の最小HTMLで提供する(下記)。
	SwaggerModule.setup(SWAGGER_PATH, app, document, { swaggerUiEnabled: false });
	const jsonDocumentUrl = `/${SWAGGER_PATH}-json`;
	app
		.getHttpAdapter()
		.get(
			`/${SWAGGER_PATH}`,
			(_req: unknown, res: { type: (t: string) => unknown; send: (body: string) => void }) => {
				res.type('text/html');
				res.send(buildSwaggerDocsHtml(jsonDocumentUrl));
			}
		);

	// ローカル/dev はスキーマを自動同期して即起動できるようにする。
	// 本番(D1)は wrangler マイグレーションで適用し、AI/アプリは実行しない(CLAUDE.md)。
	if (env.autoSyncSchema) {
		const orm = app.get(MikroORM);
		await orm.schema.update();
	}

	return { app, env };
}
