// suspensions テーブル(db §5.8)。管理者によるユーザー凍結記録。
import { EntitySchema, Opt } from '@mikro-orm/core';
import { SuspensionStatus } from '../../../domain/moderation';

export class SuspensionEntity {
	id!: string;
	userId!: string;
	reasonCategory!: string;
	status!: Opt<SuspensionStatus>;
	suspendedBy!: string;
	suspendedAt!: Opt<Date>;
	liftedAt!: Date | null;
}

export const suspensionSchema = new EntitySchema<SuspensionEntity>({
	class: SuspensionEntity,
	tableName: 'suspensions',
	indexes: [{ name: 'idx_suspensions_user_status', properties: ['userId', 'status'] }],
	properties: {
		id: { type: 'string', primary: true },
		userId: { type: 'string' },
		reasonCategory: { type: 'string' },
		status: { type: 'string', default: SuspensionStatus.ACTIVE },
		suspendedBy: { type: 'string' },
		suspendedAt: { type: 'datetime', onCreate: () => new Date() },
		liftedAt: { type: 'datetime', nullable: true }
	}
});
