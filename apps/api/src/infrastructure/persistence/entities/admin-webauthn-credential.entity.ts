// admin_webauthn_credentials テーブル(db §5.14)。利用者とはストア分離。公開鍵のみ保存(秘密鍵は認証器内)。
import { EntitySchema, Opt } from '@mikro-orm/core';

export class AdminWebauthnCredentialEntity {
	id!: string;
	adminAccountId!: string;
	credentialId!: string;
	publicKey!: string;
	signCount!: Opt<number>;
	transports!: string | null;
	aaguid!: string | null;
	nickname!: string | null;
	lastUsedAt!: Date | null;
	createdAt!: Opt<Date>;
}

export const adminWebauthnCredentialSchema = new EntitySchema<AdminWebauthnCredentialEntity>({
	class: AdminWebauthnCredentialEntity,
	tableName: 'admin_webauthn_credentials',
	indexes: [{ name: 'idx_admin_webauthn_admin', properties: ['adminAccountId'] }],
	properties: {
		id: { type: 'string', primary: true },
		adminAccountId: { type: 'string' },
		credentialId: { type: 'string', unique: 'uq_admin_webauthn_credential_id' },
		publicKey: { type: 'string' },
		signCount: { type: 'integer', default: 0 },
		transports: { type: 'string', nullable: true },
		aaguid: { type: 'string', nullable: true },
		nickname: { type: 'string', nullable: true },
		lastUsedAt: { type: 'datetime', nullable: true },
		createdAt: { type: 'datetime', onCreate: () => new Date() }
	}
});
