// ヘルプ記事の公開閲覧ユースケース(BR-CONTENT-005)のテスト。認可・ログイン不要。
import { HelpArticleStatus } from '../domain/content';
import { InMemoryHelpArticleRepository } from './admin/content-fakes';
import { HelpArticleRecord } from './admin/content-models';
import { PublicHelpArticleService } from './help-article.service';

function record(overrides: Partial<HelpArticleRecord>): HelpArticleRecord {
	return {
		id: 'ha-1',
		title: 'プロフィールの編集方法',
		slug: 'edit-profile',
		category: 'アカウント',
		bodyMarkdown: '# プロフィールの編集方法',
		status: HelpArticleStatus.PUBLISHED,
		updatedBy: 'admin-1',
		createdAt: new Date('2026-06-01T00:00:00Z'),
		updatedAt: new Date('2026-06-01T00:00:00Z'),
		...overrides
	};
}

describe('PublicHelpArticleService', () => {
	test('listPublished は公開状態の記事のみ返す(非公開は含まない)', async () => {
		const helpArticles = new InMemoryHelpArticleRepository([
			record({ id: 'ha-1', status: HelpArticleStatus.PUBLISHED }),
			record({ id: 'ha-2', status: HelpArticleStatus.UNPUBLISHED })
		]);
		const service = new PublicHelpArticleService({ helpArticles });

		const articles = await service.listPublished();
		expect(articles.map((a) => a.id)).toEqual(['ha-1']);
	});

	test('listPublished は記事が無ければ空配列を返す', async () => {
		const service = new PublicHelpArticleService({
			helpArticles: new InMemoryHelpArticleRepository([])
		});
		expect(await service.listPublished()).toEqual([]);
	});

	test('findPublishedBySlug は公開記事をスラッグで取得できる', async () => {
		const helpArticles = new InMemoryHelpArticleRepository([
			record({ id: 'ha-1', slug: 'edit-profile', status: HelpArticleStatus.PUBLISHED })
		]);
		const service = new PublicHelpArticleService({ helpArticles });

		const article = await service.findPublishedBySlug('edit-profile');
		expect(article?.id).toBe('ha-1');
	});

	test('findPublishedBySlug は非公開記事なら null を返す(AC: 非公開記事は表示されない)', async () => {
		const helpArticles = new InMemoryHelpArticleRepository([
			record({ slug: 'draft-article', status: HelpArticleStatus.UNPUBLISHED })
		]);
		const service = new PublicHelpArticleService({ helpArticles });

		expect(await service.findPublishedBySlug('draft-article')).toBeNull();
	});

	test('findPublishedBySlug は存在しないスラッグなら null を返す', async () => {
		const service = new PublicHelpArticleService({
			helpArticles: new InMemoryHelpArticleRepository([])
		});
		expect(await service.findPublishedBySlug('unknown')).toBeNull();
	});
});
