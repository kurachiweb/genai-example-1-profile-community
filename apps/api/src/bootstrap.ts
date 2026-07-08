// NestJS アプリケーションの共通初期化(Frameworks & Drivers)。
// ローカル/dev(main.ts)と Cloudflare Workers(worker.ts)の両エントリポイントから呼ばれる。
import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnv, type AppEnv } from './config/env';
import { buildValidationPipe } from './interface/graphql/validation';

export async function createApp(): Promise<{ app: INestApplication; env: AppEnv }> {
	// 必須環境変数を起動時に検証(欠落時はここで失敗)。
	const env = loadEnv();

	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(buildValidationPipe());
	app.enableShutdownHooks();

	// ローカル/dev はスキーマを自動同期して即起動できるようにする。
	// 本番(D1)は wrangler マイグレーションで適用し、AI/アプリは実行しない(CLAUDE.md)。
	if (env.autoSyncSchema) {
		const orm = app.get(MikroORM);
		// MikroORM 7 は orm.schema(getter)に集約。updateSchema → update。
		await orm.schema.update();
	}

	return { app, env };
}
