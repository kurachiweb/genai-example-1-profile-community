// unfreeze_requests テーブル(db §5.8)。凍結ユーザーの解除リクエスト。
import { EntitySchema, Opt } from '@mikro-orm/core';
import { UnfreezeRequestStatus } from '../../../domain/moderation';

export class UnfreezeRequestEntity {
	id!: string;
	userId!: string;
	suspensionId!: string | null;
	reason!: string;
	supplement!: string | null;
	status!: Opt<UnfreezeRequestStatus>;
	reviewedBy!: string | null;
	createdAt!: Opt<Date>;
	reviewedAt!: Date | null;
}

export const unfreezeRequestSchema = new EntitySchema<UnfreezeRequestEntity>({
	class: UnfreezeRequestEntity,
	tableName: 'unfreeze_requests',
	indexes: [{ name: 'idx_unfreeze_user_created', properties: ['userId', 'createdAt'] }],
	properties: {
		id: { type: 'string', primary: true },
		userId: { type: 'string' },
		suspensionId: { type: 'string', nullable: true },
		reason: { type: 'text' },
		supplement: { type: 'text', nullable: true },
		status: { type: 'string', default: UnfreezeRequestStatus.PENDING },
		reviewedBy: { type: 'string', nullable: true },
		createdAt: { type: 'datetime', onCreate: () => new Date() },
		reviewedAt: { type: 'datetime', nullable: true }
	}
});
