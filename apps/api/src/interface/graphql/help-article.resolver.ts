// ヘルプ記事の公開閲覧リゾルバ(BR-CONTENT-005)。ログイン不要・薄く保つ。
import { Args, Query, Resolver } from '@nestjs/graphql';
import { PublicHelpArticleService } from '../../application/help-article.service';
import { HelpArticleRecord } from '../../application/admin/content-models';
import { HelpArticleType, PublicHelpArticleSlugArgs } from './types/help-article.type';

function present(record: HelpArticleRecord): HelpArticleType {
	return {
		title: record.title,
		slug: record.slug,
		category: record.category,
		bodyMarkdown: record.bodyMarkdown,
		updatedAt: record.updatedAt
	};
}

@Resolver()
export class HelpArticleResolver {
	constructor(private readonly helpArticles: PublicHelpArticleService) {}

	/** 公開状態の記事一覧を返す(非公開は含まない)。 */
	@Query(() => [HelpArticleType], { name: 'publicHelpArticles' })
	async publicHelpArticles(): Promise<HelpArticleType[]> {
		const records = await this.helpArticles.listPublished();
		return records.map(present);
	}

	/** スラッグを指定して公開記事を取得する。非公開/不在なら null(client 側で notFound() を呼ぶ)。 */
	@Query(() => HelpArticleType, { name: 'publicHelpArticle', nullable: true })
	async publicHelpArticle(
		@Args() args: PublicHelpArticleSlugArgs
	): Promise<HelpArticleType | null> {
		const record = await this.helpArticles.findPublishedBySlug(args.slug);
		return record ? present(record) : null;
	}
}
