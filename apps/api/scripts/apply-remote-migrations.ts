// 本番相当(D1リモート)へのマイグレーション適用スクリプト(db/02-migrations.md)。
//
// `wrangler d1 migrations apply --remote` は、CREATE TRIGGER(BEGIN...END を含む複数文の
// トリガー本体)を含むSQLに対して "incomplete input: SQLITE_ERROR [code: 7500]" で失敗する
// 既知の不具合がある(D1のクエリAPIがSQL文字列を素朴に ';' で分割するため、トリガー本体内の
// ';' で文が途中で切れてしまう)。一方 `wrangler d1 execute --file=<path>` はファイル全体を
// アップロードして一括インポートする別経路を使うため、この問題を回避できる(実機で確認済み)。
//
// 本スクリプトは `--file=` 経由でマイグレーションSQLを適用しつつ、`migrations apply` と
// 同じ追跡テーブル(d1_migrations)に自前で記録することで、通常の `wrangler d1 migrations
// list/apply` からも「適用済み」として認識される互換性を保つ。
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = join(process.cwd(), 'migrations-wrangler');

// wrangler本体が作成するテーブル定義と完全に一致させる(実機のsqlite_masterから確認済み)。
const ENSURE_MIGRATIONS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
)`;

interface D1ExecuteJsonResult {
	results: Array<Record<string, unknown>>;
}

function wrangler(args: readonly string[]): string {
	// wrangler は devDependency 経由(node_modules/.bin)で提供されるため、PATH 直下には無い。
	// npx 経由で解決することでローカル/CIどちらでも動作する。
	return execFileSync('npx', ['wrangler', ...args], { encoding: 'utf8' });
}

function executeCommand(database: string, env: string, command: string): D1ExecuteJsonResult[] {
	const output = wrangler([
		'd1',
		'execute',
		database,
		'--env',
		env,
		'--remote',
		'--command',
		command,
		'--json'
	]);
	return JSON.parse(output) as D1ExecuteJsonResult[];
}

function executeFile(database: string, env: string, filePath: string): void {
	wrangler(['d1', 'execute', database, '--env', env, '--remote', '--file', filePath]);
}

function main(): void {
	const [database, env] = process.argv.slice(2);
	if (!database || !env) {
		throw new Error('使い方: apply-remote-migrations.ts <database> <env>');
	}

	executeCommand(database, env, ENSURE_MIGRATIONS_TABLE_SQL);

	const appliedResult = executeCommand(database, env, 'select name from d1_migrations;');
	const applied = new Set((appliedResult[0]?.results ?? []).map((row) => String(row.name)));

	const pending = readdirSync(MIGRATIONS_DIR)
		.filter((name) => name.endsWith('.sql'))
		.sort()
		.filter((name) => !applied.has(name));

	if (pending.length === 0) {
		console.log('適用すべきマイグレーションはありません。');
		return;
	}

	for (const name of pending) {
		console.log(`適用中: ${name}`);
		executeFile(database, env, join(MIGRATIONS_DIR, name));
		executeCommand(database, env, `insert into d1_migrations (name) values ('${name}');`);
		console.log(`適用完了: ${name}`);
	}
}

main();
