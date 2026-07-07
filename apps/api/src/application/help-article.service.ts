// ヘルプ記事の公開閲覧ユースケース(BR-CONTENT-005)。
// 認可・ログイン不要。編集/公開切替は application/admin/help-article.service.ts(HelpArticleService, support 以上)が担う。
import { HelpArticleStatus } from '../domain/content';
import { HelpArticleRepository } from './admin/content-gateways';
import { HelpArticleRecord } from './admin/content-models';

export interface PublicHelpArticleServiceDeps {
	readonly helpArticles: HelpArticleRepository;
}

export class PublicHelpArticleService {
	constructor(private readonly deps: PublicHelpArticleServiceDeps) {}

	/** 公開状態の記事のみ返す(非公開は公開面に出さない、BR-CONTENT-005)。 */
	async listPublished(): Promise<HelpArticleRecord[]> {
		const articles = await this.deps.helpArticles.list();
		return articles.filter((a) => a.status === HelpArticleStatus.PUBLISHED);
	}

	/** スラッグを指定して公開記事を取得する。非公開/不在なら null(呼び出し側で 404 相当を表示)。 */
	async findPublishedBySlug(slug: string): Promise<HelpArticleRecord | null> {
		const article = await this.deps.helpArticles.findBySlug(slug);
		if (!article || article.status !== HelpArticleStatus.PUBLISHED) return null;
		return article;
	}
}
