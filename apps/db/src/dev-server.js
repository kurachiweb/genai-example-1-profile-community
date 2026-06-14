// apps/db のローカル開発用ヘルスサーバー。
// SQLite はサーバーレス(ファイルベース)でプロセスを常駐させないため、
// compose の healthcheck が疎通を確認できるよう、本サーバーがポートを開いて生存を表明する。
// ローカル開発専用であり、本番(Cloudflare D1)では使用しない。
import { createServer } from 'node:http';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_PORT = 55030;
const DEFAULT_HOST = '0.0.0.0';

// SQLite 実体ファイルの格納先(compose の db_data ボリュームのマウント先)。
const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '.data');

export async function startDevServer({ port = DEFAULT_PORT, host = DEFAULT_HOST } = {}) {
  // ボリュームが空の初回起動でも SQLite の配置先を確実に用意する。
  await mkdir(DATA_DIR, { recursive: true });

  const server = createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: '@app/db' }));
  });

  // listen 失敗(ポート競合など)を呼び出し側へ確実に伝播させる。
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      resolve();
    });
  });

  return server;
}
