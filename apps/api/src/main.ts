// 内部 GraphQL API のエントリポイント(Frameworks & Drivers)。
// ローカル開発は @nestjs/platform-express で起動する。本番の Hono/Workers アダプタは後続ユニット
// (coding/04-nestjs.md §7)。ランタイム差は本層に閉じ込め、Entities/Use Cases に持ち込まない。
import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';
import { buildValidationPipe } from './interface/graphql/validation';

async function bootstrap(): Promise<void> {
  // 必須環境変数を起動時に検証(欠落時はここで失敗)。
  const env = loadEnv();

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(buildValidationPipe());
  app.enableShutdownHooks();

  // ローカル/dev はスキーマを自動同期して即起動できるようにする。
  // 本番(D1)は wrangler マイグレーションで適用し、AI/アプリは実行しない(CLAUDE.md)。
  if (env.autoSyncSchema) {
    const orm = app.get(MikroORM);
    await orm.getSchemaGenerator().updateSchema();
  }

  await app.listen(env.port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`[@app/api] 内部 GraphQL API listening on http://0.0.0.0:${env.port}/graphql`);
}

void bootstrap();
