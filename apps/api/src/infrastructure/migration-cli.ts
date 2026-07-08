// MikroORM Migrator の CLI ラッパー(Frameworks & Drivers)。
// `mikro-orm` バイナリではなく、既存の seed.ts と同じ ts-node 実行パターンに揃える。
// `pnpm --filter @app/api migration:create|up|down` から呼ばれる(db/02-migrations.md §2)。
// 本番(D1)への適用は wrangler d1 migrations が担い、本スクリプトは実行しない(人間のみ、CLAUDE.md)。
import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { loadEnv } from '../config/env';
import { buildMikroOrmConfig, resolveDbName } from './mikro-orm.config';

type MigrationCommand = 'create' | 'up' | 'down';

function parseCommand(argv: readonly string[]): MigrationCommand {
	const command = argv[2];
	if (command === 'create' || command === 'up' || command === 'down') {
		return command;
	}
	throw new Error(
		`不明なマイグレーションコマンドです: ${String(command)}(create|up|down のいずれかを指定してください)`
	);
}

export async function runMigrationCommand(command: MigrationCommand): Promise<void> {
	const env = loadEnv();
	const orm = await MikroORM.init(buildMikroOrmConfig(resolveDbName(env.databaseUrl)));
	try {
		switch (command) {
			case 'create':
				await orm.migrator.create();
				break;
			case 'up':
				await orm.migrator.up();
				break;
			case 'down':
				await orm.migrator.down();
				break;
		}
	} finally {
		await orm.close(true);
	}
}

if (require.main === module) {
	void runMigrationCommand(parseCommand(process.argv)).catch((error: unknown) => {
		console.error('[@app/api] マイグレーション実行に失敗しました:', error);
		process.exitCode = 1;
	});
}
