// inquiries テーブル(db §5.12)。問い合わせ(general/report/unfreeze)。
import { EntitySchema, Opt } from '@mikro-orm/core';

export class InquiryEntity {
	id!: string;
	category!: string;
	subject!: string | null;
	body!: string;
	contactEmail!: string | null;
	status!: Opt<string>;
	createdByUserId!: string | null;
	createdAt!: Opt<Date>;
	updatedAt!: Opt<Date>;
}

export const inquirySchema = new EntitySchema<InquiryEntity>({
	class: InquiryEntity,
	tableName: 'inquiries',
	properties: {
		id: { type: 'string', primary: true },
		category: { type: 'string' },
		subject: { type: 'string', nullable: true },
		body: { type: 'text' },
		contactEmail: { type: 'string', nullable: true },
		status: { type: 'string', default: 'OPEN' },
		createdByUserId: { type: 'string', nullable: true },
		createdAt: { type: 'datetime', onCreate: () => new Date() },
		updatedAt: { type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date() }
	}
});
