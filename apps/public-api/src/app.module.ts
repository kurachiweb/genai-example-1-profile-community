// アプリのルートモジュール = Composition root(coding/01-architecture.md §2.1)。
// MikroORM の結線と、共通エンベロープ Interceptor・例外フィルタのグローバル登録を行う。
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { buildMikroOrmConfig, resolveDbName } from './infrastructure/mikro-orm.config';
import { DomainExceptionFilter } from './interface/rest/filters/domain-error.filter';
import { EnvelopeInterceptor } from './interface/rest/interceptors/envelope.interceptor';
import { ProfileModule } from './interface/rest/profile.module';

@Module({
	imports: [
		MikroOrmModule.forRootAsync({
			useFactory: () => buildMikroOrmConfig(resolveDbName(process.env.DATABASE_URL))
		}),
		ProfileModule
	],
	providers: [
		// 成功応答を共通エンベロープへ一律整形する(BR-COMMON-011)。
		{ provide: APP_INTERCEPTOR, useClass: EnvelopeInterceptor },
		// 例外 → コード → HTTP + 共通エンベロープへ写像する(BR-API-011)。
		{ provide: APP_FILTER, useClass: DomainExceptionFilter }
	]
})
export class AppModule {}
