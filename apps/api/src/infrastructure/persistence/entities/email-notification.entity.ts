// email_notifications テーブル(db §5.11)。管理者が配信するメール通知。
import { EntitySchema, Opt } from '@mikro-orm/core';

export class EmailNotificationEntity {
	id!: string;
	subject!: string;
	templateKey!: string;
	targetCondition!: string;
	status!: Opt<string>;
	createdBy!: string;
	sentAt!: Date | null;
	createdAt!: Opt<Date>;
}

export const emailNotificationSchema = new EntitySchema<EmailNotificationEntity>({
	class: EmailNotificationEntity,
	tableName: 'email_notifications',
	properties: {
		id: { type: 'string', primary: true },
		subject: { type: 'string' },
		templateKey: { type: 'string' },
		targetCondition: { type: 'string' },
		status: { type: 'string', default: 'draft' },
		createdBy: { type: 'string' },
		sentAt: { type: 'datetime', nullable: true },
		createdAt: { type: 'datetime', onCreate: () => new Date() }
	}
});
