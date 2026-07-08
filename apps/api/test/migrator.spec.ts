// MikroORM Migrator の統合テスト(Frameworks & Drivers)。
// wrangler d1 migrations で本番(D1)に適用されるのと同じマイグレーションファイル(migrations/*.ts)が
// 正しく適用・巻き戻しできること、audit_logs の追記専用トリガーが機能することを検証する
// (db/02-migrations.md §2・§5.1)。既存の統合テスト(schema.create()を使う)とは異なり、
// 実際にリリースされるマイグレーションファイル自体を対象にする。
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MikroORM } from '@mikro-orm/core';
import { buildMikroOrmConfig } from '../src/infrastructure/mikro-orm.config';

const TMP_DIR = join(tmpdir(), 'genai-profile-community-migrator-spec');

function tableNames(rows: ReadonlyArray<{ name: string }>): string[] {
	return rows.map((row) => row.name).sort();
}

describe('MikroORM Migrator(migrations/*.ts)', () => {
	let dbPath: string;
	let orm: MikroORM;

	beforeEach(async () => {
		mkdirSync(TMP_DIR, { recursive: true });
		dbPath = join(TMP_DIR, `${Date.now()}-${Math.random().toString(36).slice(2)}.sqlite`);
		orm = await MikroORM.init(buildMikroOrmConfig(dbPath));
	});

	afterEach(async () => {
		await orm.close(true);
		if (existsSync(TMP_DIR)) {
			rmSync(TMP_DIR, { recursive: true, force: true });
		}
	});

	test('up() で全エンティティ分のテーブルが作成される', async () => {
		await orm.migrator.up();

		const connection = orm.em.getConnection();
		const rows = await connection.execute<Array<{ name: string }>>(
			"select name from sqlite_master where type = 'table' and name not like 'mikro_orm%' and name not like 'sqlite_%'"
		);

		expect(tableNames(rows)).toEqual(
			[
				'admin_accounts',
				'admin_webauthn_credentials',
				'announcements',
				'api_keys',
				'app_settings',
				'audit_logs',
				'email_notifications',
				'help_articles',
				'inquiries',
				'policies',
				'profiles',
				'reports',
				'sns_links',
				'suspensions',
				'unfreeze_requests',
				'users'
			].sort()
		);
	});

	test('audit_logs は追記専用で UPDATE/DELETE が拒否される(BR-ADMIN-010)', async () => {
		await orm.migrator.up();
		const connection = orm.em.getConnection();

		await connection.execute(
			"insert into audit_logs (id, event_type, actor_type, result, occurred_at) values ('log-1', 'login', 'user', 'success', datetime('now'))"
		);

		await expect(
			connection.execute("update audit_logs set result = 'failure' where id = 'log-1'")
		).rejects.toThrow(/append-only/);

		await expect(connection.execute("delete from audit_logs where id = 'log-1'")).rejects.toThrow(
			/append-only/
		);
	});

	test('down() で全テーブルが削除される', async () => {
		await orm.migrator.up();
		await orm.migrator.down();

		const connection = orm.em.getConnection();
		const rows = await connection.execute<Array<{ name: string }>>(
			"select name from sqlite_master where type = 'table' and name not like 'mikro_orm%' and name not like 'sqlite_%'"
		);

		expect(rows).toEqual([]);
	});
});
