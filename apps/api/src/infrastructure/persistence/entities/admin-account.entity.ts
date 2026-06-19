// admin_accounts テーブル(db §5.9)。利用者とは別ストア・RBAC。MikroORM 7 EntitySchema。
import { EntitySchema, Opt } from '@mikro-orm/core';
import { AdminAccountStatus } from '../../../domain/admin-account';
import { AdminRole } from '../../../domain/admin-role';

export class AdminAccountEntity {
	id!: string;
	email!: string;
	emailNormalized!: string;
	passwordHash!: string;
	role!: AdminRole;
	status!: Opt<AdminAccountStatus>;
	createdAt!: Opt<Date>;
	updatedAt!: Opt<Date>;
}

export const adminAccountSchema = new EntitySchema<AdminAccountEntity>({
	class: AdminAccountEntity,
	tableName: 'admin_accounts',
	properties: {
		id: { type: 'string', primary: true },
		email: { type: 'string' },
		emailNormalized: { type: 'string', unique: 'uq_admin_accounts_email_normalized' },
		passwordHash: { type: 'string' },
		role: { type: 'string' },
		status: { type: 'string', default: AdminAccountStatus.ACTIVE },
		createdAt: { type: 'datetime', onCreate: () => new Date() },
		updatedAt: { type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date() }
	}
});
