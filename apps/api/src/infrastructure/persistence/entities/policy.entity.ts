// policies テーブル(db §5.13)。規約・プライバシーポリシーの版管理。公開中は type ごとに 1 版のみ(アプリ層で保証)。
import { EntitySchema, Opt } from '@mikro-orm/core';

export class PolicyEntity {
	id!: string;
	type!: string;
	version!: number;
	bodyMarkdown!: string;
	isPublished!: Opt<boolean>;
	requiresReconsent!: Opt<boolean>;
	effectiveDate!: Date;
	editedBy!: string;
	createdAt!: Opt<Date>;
}

export const policySchema = new EntitySchema<PolicyEntity>({
	class: PolicyEntity,
	tableName: 'policies',
	uniques: [{ name: 'uq_policies_type_version', properties: ['type', 'version'] }],
	properties: {
		id: { type: 'string', primary: true },
		type: { type: 'string' },
		version: { type: 'integer' },
		bodyMarkdown: { type: 'text' },
		isPublished: { type: 'boolean', default: false },
		requiresReconsent: { type: 'boolean', default: false },
		effectiveDate: { type: 'datetime' },
		editedBy: { type: 'string' },
		createdAt: { type: 'datetime', onCreate: () => new Date() }
	}
});
