// reports テーブル(db §5.7)。プロフィール通報。
import { EntitySchema, Opt } from '@mikro-orm/core';
import { ReportReasonCategory, ReportStatus } from '../../../domain/moderation';

export class ReportEntity {
	id!: string;
	targetUserId!: string | null;
	targetHandle!: string;
	reasonCategory!: ReportReasonCategory;
	detail!: string | null;
	contactEmail!: string | null;
	status!: Opt<ReportStatus>;
	duplicateCount!: Opt<number>;
	inquiryId!: string | null;
	createdAt!: Opt<Date>;
	updatedAt!: Opt<Date>;
}

export const reportSchema = new EntitySchema<ReportEntity>({
	class: ReportEntity,
	tableName: 'reports',
	indexes: [{ name: 'idx_reports_target_status', properties: ['targetUserId', 'status'] }],
	properties: {
		id: { type: 'string', primary: true },
		targetUserId: { type: 'string', nullable: true },
		targetHandle: { type: 'string' },
		reasonCategory: { type: 'string' },
		detail: { type: 'text', nullable: true },
		contactEmail: { type: 'string', nullable: true },
		status: { type: 'string', default: ReportStatus.OPEN },
		duplicateCount: { type: 'integer', default: 1 },
		inquiryId: { type: 'string', nullable: true },
		createdAt: { type: 'datetime', onCreate: () => new Date() },
		updatedAt: { type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date() }
	}
});
