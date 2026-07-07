// ヘルプ記事の公開閲覧モジュール(BR-CONTENT-005)。永続化 Gateway は admin 側の
// content-gateways/content.repositories(HELP_ARTICLE_REPOSITORY)を再利用する(ヘルプ記事データの保存先は単一)。
import { Module } from '@nestjs/common';
import {
	HELP_ARTICLE_REPOSITORY,
	HelpArticleRepository
} from '../../application/admin/content-gateways';
import { MikroHelpArticleRepository } from '../../infrastructure/persistence/content.repositories';
import { PublicHelpArticleService } from '../../application/help-article.service';
import { HelpArticleResolver } from './help-article.resolver';

@Module({
	providers: [
		MikroHelpArticleRepository,
		{ provide: HELP_ARTICLE_REPOSITORY, useExisting: MikroHelpArticleRepository },
		{
			provide: PublicHelpArticleService,
			inject: [HELP_ARTICLE_REPOSITORY],
			useFactory: (helpArticles: HelpArticleRepository) =>
				new PublicHelpArticleService({ helpArticles })
		},
		HelpArticleResolver
	]
})
export class HelpArticleModule {}
