// scripts/export-wrangler-migration.ts の統合テスト。
// このスクリプトは ts-node(CJS)実行を前提に require/__dirname 相当の CJS 実行モデルに依存するため、
// jest(ESM モード、jest.config.ts 参照)から直接 import せず、実際の呼び出し経路と同じ子プロセスで検証する。
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// jest は apps/api を cwd として実行される(package.json の test スクリプト参照)。
const API_ROOT = process.cwd();

describe('export-wrangler-migration スクリプト', () => {
	let outputDir: string;

	beforeEach(() => {
		outputDir = mkdtempSync(join(tmpdir(), 'genai-profile-community-wrangler-migration-'));
	});

	afterEach(() => {
		if (existsSync(outputDir)) {
			rmSync(outputDir, { recursive: true, force: true });
		}
	});

	test('MikroORM の初回マイグレーションから wrangler 向け SQL ファイルを生成する', () => {
		execFileSync(
			'ts-node',
			[
				'-r',
				'tsconfig-paths/register',
				'scripts/export-wrangler-migration.ts',
				'Migration20260708044931.ts'
			],
			{
				cwd: API_ROOT,
				env: { ...process.env, WRANGLER_MIGRATIONS_OUTPUT_DIR: outputDir }
			}
		);

		const files = readdirSync(outputDir).filter((name) => name.endsWith('.sql'));
		expect(files).toEqual(['0001_Migration20260708044931.sql']);

		const sql = readFileSync(join(outputDir, files[0]), 'utf-8');
		expect(sql).toContain('create table `users`');
		expect(sql).toContain('trg_audit_logs_no_update');
		expect(sql).toContain('trg_audit_logs_no_delete');
	});
});
