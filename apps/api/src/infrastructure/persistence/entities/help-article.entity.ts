// help_articles テーブル(db §5.12)。ヘルプ記事(マークダウン・スラッグ一意)。
import { EntitySchema, Opt } from '@mikro-orm/core';

export class HelpArticleEntity {
	id!: string;
	title!: string;
	slug!: string;
	category!: string | null;
	bodyMarkdown!: string;
	status!: Opt<string>;
	updatedBy!: string;
	createdAt!: Opt<Date>;
	updatedAt!: Opt<Date>;
}

export const helpArticleSchema = new EntitySchema<HelpArticleEntity>({
	class: HelpArticleEntity,
	tableName: 'help_articles',
	properties: {
		id: { type: 'string', primary: true },
		title: { type: 'string' },
		slug: { type: 'string', unique: 'uq_help_articles_slug' },
		category: { type: 'string', nullable: true },
		bodyMarkdown: { type: 'text' },
		status: { type: 'string', default: 'unpublished' },
		updatedBy: { type: 'string' },
		createdAt: { type: 'datetime', onCreate: () => new Date() },
		updatedAt: { type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date() }
	}
});
