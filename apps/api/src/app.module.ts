// アプリのルートモジュール = Composition root(coding/01-architecture.md §2.1)。
// MikroORM・GraphQL(Apollo)の結線と、ドメイン例外フィルタのグローバル登録を行う。
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ProfileService } from './application/profile.service';
import { buildMikroOrmConfig, resolveDbName } from './infrastructure/mikro-orm.config';
import { AdminModule } from './interface/graphql/admin/admin.module';
import { DomainErrorFilter } from './interface/graphql/domain-error.filter';
import { PolicyModule } from './interface/graphql/policy.module';
import { ProfileModule } from './interface/graphql/profile.module';
import { UserModule } from './interface/graphql/user.module';
import { createSnsLinkLoader } from './interface/graphql/sns-link.loader';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
	imports: [
		MikroOrmModule.forRootAsync({
			useFactory: () => buildMikroOrmConfig(resolveDbName(process.env.DATABASE_URL))
		}),
		// 利用者向け GraphQL(認証・アカウント管理・API キー)。ProfileModule より先に登録する。
		UserModule,
		ProfileModule,
		// 規約・プライバシーポリシーの公開閲覧 GraphQL(ログイン不要、BR-CONTENT-010)。
		PolicyModule,
		// 管理者コンソール GraphQL(認証・RBAC・ユーザー管理・モデレーション・APIキー・統計・監査)。
		AdminModule,
		GraphQLModule.forRootAsync<ApolloDriverConfig>({
			driver: ApolloDriver,
			imports: [ProfileModule],
			inject: [ProfileService],
			useFactory: (profileService: ProfileService) => ({
				// code-first。スキーマは生成物として扱い、メモリ上に構築する(api/01-graphql-internal.md §7)。
				autoSchemaFile: true,
				sortSchema: true,
				// 探索 UI は dev/local 限定で有効化し、本番では無効化する(api §7)。
				playground: !isProduction,
				introspection: !isProduction,
				// 本番ではスタックトレースを応答へ含めない(秘匿、BR-COMMON-012/014)。
				includeStacktraceInErrorResponses: !isProduction,
				// DataLoader はリクエストスコープで生成する(api §5)。
				context: ({ req }: { req: unknown }) => ({
					req,
					snsLinkLoader: createSnsLinkLoader(profileService)
				})
			})
		})
	],
	providers: [
		// ドメイン例外 → extensions.code への写像をグローバルに適用(coding/04-nestjs.md §4.4)。
		{ provide: APP_FILTER, useClass: DomainErrorFilter }
	]
})
export class AppModule {}
