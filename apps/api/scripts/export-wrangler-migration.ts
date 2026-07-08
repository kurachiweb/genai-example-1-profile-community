// MikroORM Migrator が生成した migrations/*.ts から、wrangler d1 migrations が読める素の .sql を
// migrations-wrangler/ へ書き出す(db/02-migrations.md §1)。MikroORM 側の追跡テーブルとは別に、
// wrangler 側は自身の追跡テーブルでマイグレーション適用状況を管理する(独立したファイル体系のため)。
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// `pnpm --filter @app/api migration:export-wrangler` 経由で apps/api を cwd として実行される前提。
const MIGRATIONS_DIR = join(process.cwd(), 'migrations');
const OUTPUT_DIR =
	process.env.WRANGLER_MIGRATIONS_OUTPUT_DIR ?? join(process.cwd(), 'migrations-wrangler');

interface SqlCollectingMigration {
	up(): void | Promise<void>;
	addSql(sql: string): void;
}

/** MikroORM の Migration#addSql を差し替え、up() 実行時に発行される SQL 文字列だけを集める。 */
export async function collectMigrationSql(migrationFilePath: string): Promise<string[]> {
	// ts-node の require フックで .ts をそのまま読み込む(seed.ts 等と同じ CJS 実行パターン)。
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const loaded: Record<string, unknown> = require(migrationFilePath);
	const MigrationClass = Object.values(loaded).find(
		(candidate): candidate is new () => SqlCollectingMigration => typeof candidate === 'function'
	);
	if (!MigrationClass) {
		throw new Error(`マイグレーションクラスが見つかりません: ${migrationFilePath}`);
	}

	const statements: string[] = [];
	const instance = new MigrationClass();
	instance.addSql = (sql: string) => {
		statements.push(sql);
	};
	await instance.up();
	return statements;
}

export function nextSequence(outputDir: string): string {
	if (!existsSync(outputDir)) {
		return '0001';
	}
	const existingCount = readdirSync(outputDir).filter((name) => name.endsWith('.sql')).length;
	return String(existingCount + 1).padStart(4, '0');
}

async function main(): Promise<void> {
	const targetFileArg = process.argv[2];
	if (!targetFileArg) {
		throw new Error(
			'使い方: pnpm --filter @app/api migration:export-wrangler <migrations配下のファイル名>(例: Migration20260708044931.ts)'
		);
	}
	if (!existsSync(OUTPUT_DIR)) {
		mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	const migrationPath = join(MIGRATIONS_DIR, targetFileArg);
	const statements = await collectMigrationSql(migrationPath);
	const baseName = targetFileArg.replace(/\.ts$/, '');
	const outputPath = join(OUTPUT_DIR, `${nextSequence(OUTPUT_DIR)}_${baseName}.sql`);
	writeFileSync(outputPath, statements.map((sql) => `${sql}\n`).join(''), 'utf-8');
	console.log(`[@app/api] wrangler 向け SQL を出力しました: ${outputPath}`);
}

if (require.main === module) {
	void main().catch((error: unknown) => {
		console.error('[@app/api] export-wrangler-migration に失敗しました:', error);
		process.exitCode = 1;
	});
}
