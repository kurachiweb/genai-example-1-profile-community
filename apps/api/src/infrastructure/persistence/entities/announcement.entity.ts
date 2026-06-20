// announcements テーブル(db §5.11)。サイト内お知らせ(マークダウン・サニタイズ後表示)。
import { EntitySchema, Opt } from '@mikro-orm/core';

export class AnnouncementEntity {
	id!: string;
	title!: string;
	bodyMarkdown!: string;
	status!: Opt<string>;
	importance!: Opt<string>;
	publishStartAt!: Date | null;
	publishEndAt!: Date | null;
	createdBy!: string;
	createdAt!: Opt<Date>;
	updatedAt!: Opt<Date>;
}

export const announcementSchema = new EntitySchema<AnnouncementEntity>({
	class: AnnouncementEntity,
	tableName: 'announcements',
	properties: {
		id: { type: 'string', primary: true },
		title: { type: 'string' },
		bodyMarkdown: { type: 'text' },
		status: { type: 'string', default: 'draft' },
		importance: { type: 'string', default: 'normal' },
		publishStartAt: { type: 'datetime', nullable: true },
		publishEndAt: { type: 'datetime', nullable: true },
		createdBy: { type: 'string' },
		createdAt: { type: 'datetime', onCreate: () => new Date() },
		updatedAt: { type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date() }
	}
});
