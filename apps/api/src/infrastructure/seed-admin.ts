// ローカル開発用シード(初期スーパー管理者)。`pnpm --filter @app/api seed:admin` で実行する。
// 仕様上、初期スーパー管理者はプロビジョニング手順で作成する(画面からの自己昇格は不可、BR-ADMIN-001)。
// 本番(D1)では実行しない。資格情報は環境変数で上書きでき、未指定なら開発用の既定値を用いる。
import 'reflect-metadata';
import { hash } from '@node-rs/argon2';
import { MikroORM } from '@mikro-orm/core';
import { ulid } from 'ulid';
import { AdminRole } from '../domain/admin-role';
import { normalizeEmail } from '../domain/admin-credentials';
import { loadEnv } from '../config/env';
import { buildMikroOrmConfig, resolveDbName } from './mikro-orm.config';
import { AdminAccountEntity } from './persistence/entities/admin-account.entity';

const DEFAULT_EMAIL = 'admin@example.com';
const DEFAULT_PASSWORD = 'admin-password-12345';

export async function runAdminSeed(): Promise<void> {
	const env = loadEnv();
	const email = normalizeEmail(process.env.ADMIN_SEED_EMAIL ?? DEFAULT_EMAIL);
	const password = process.env.ADMIN_SEED_PASSWORD ?? DEFAULT_PASSWORD;

	const orm = await MikroORM.init(buildMikroOrmConfig(resolveDbName(env.databaseUrl)));
	try {
		await orm.schema.update();
		const em = orm.em.fork();
		const existing = await em.findOne(AdminAccountEntity, { emailNormalized: email });
		if (existing) {
			console.log(`[@app/api] 初期スーパー管理者は既に存在します(${email})。`);
			return;
		}
		em.create(AdminAccountEntity, {
			id: ulid(),
			email,
			emailNormalized: email,
			passwordHash: await hash(password),
			role: AdminRole.SUPER_ADMIN,
			status: 'active'
		});
		await em.flush();
		console.log('[@app/api] 初期スーパー管理者を作成しました。');
		console.log(`  email   : ${email}`);
		console.log(`  password: ${password}`);
		console.log('  ※ ローカル開発専用。本番では使用しないこと。');
	} finally {
		await orm.close(true);
	}
}

if (require.main === module) {
	void runAdminSeed().catch((error: unknown) => {
		console.error('[@app/api] seed:admin 失敗:', error);
		process.exitCode = 1;
	});
}
