// AdminAccountRepository(Gateway)の MikroORM 実装(Interface Adapters)。
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { AdminAccountStatus } from '../../domain/admin-account';
import { AdminRole } from '../../domain/admin-role';
import { normalizeEmail } from '../../domain/admin-credentials';
import { AdminAccountRepository } from '../../application/admin/gateways';
import { AdminAccountRecord } from '../../application/admin/models';
import { AdminAccountEntity } from './entities/admin-account.entity';
import { AdminWebauthnCredentialEntity } from './entities/admin-webauthn-credential.entity';

function toRecord(entity: AdminAccountEntity): AdminAccountRecord {
	return {
		id: entity.id,
		email: entity.email,
		passwordHash: entity.passwordHash,
		role: entity.role,
		status: (entity.status ?? AdminAccountStatus.ACTIVE) as AdminAccountStatus,
		createdAt: entity.createdAt as Date,
		updatedAt: entity.updatedAt as Date
	};
}

@Injectable()
export class MikroAdminAccountRepository implements AdminAccountRepository {
	constructor(private readonly em: EntityManager) {}

	async findById(id: string): Promise<AdminAccountRecord | null> {
		const entity = await this.em.fork().findOne(AdminAccountEntity, { id });
		return entity ? toRecord(entity) : null;
	}

	async findByEmailNormalized(emailNormalized: string): Promise<AdminAccountRecord | null> {
		const entity = await this.em
			.fork()
			.findOne(AdminAccountEntity, { emailNormalized: normalizeEmail(emailNormalized) });
		return entity ? toRecord(entity) : null;
	}

	async countActiveByRole(role: AdminRole): Promise<number> {
		return this.em.fork().count(AdminAccountEntity, { role, status: AdminAccountStatus.ACTIVE });
	}

	async list(): Promise<AdminAccountRecord[]> {
		const entities = await this.em
			.fork()
			.find(AdminAccountEntity, {}, { orderBy: { createdAt: 'asc' } });
		return entities.map(toRecord);
	}

	async countPasskeys(adminId: string): Promise<number> {
		return this.em.fork().count(AdminWebauthnCredentialEntity, { adminAccountId: adminId });
	}

	async save(record: AdminAccountRecord): Promise<void> {
		const em = this.em.fork();
		const existing = await em.findOne(AdminAccountEntity, { id: record.id });
		if (existing) {
			existing.email = record.email;
			existing.emailNormalized = normalizeEmail(record.email);
			existing.passwordHash = record.passwordHash;
			existing.role = record.role;
			existing.status = record.status;
			await em.flush();
			return;
		}
		const entity = em.create(AdminAccountEntity, {
			id: record.id,
			email: record.email,
			emailNormalized: normalizeEmail(record.email),
			passwordHash: record.passwordHash,
			role: record.role,
			status: record.status
		});
		await em.persist(entity).flush();
	}
}
