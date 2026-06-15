import { test } from 'node:test';
import assert from 'node:assert/strict';
import { connect } from 'node:net';
import { get } from 'node:http';
import { startDevServer } from '../src/dev-server.js';

// 固定ポート(48030)は他プロセスと衝突しうるため、テストでは OS にエフェメラルポート(0)を割り当てさせる。
async function withServer(run) {
  const server = await startDevServer({ port: 0, host: '127.0.0.1' });
  try {
    await run(server.address().port);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('compose の healthcheck と同じ TCP 接続を受け付ける', async () => {
  await withServer(async (port) => {
    await new Promise((resolve, reject) => {
      const socket = connect(port, '127.0.0.1');
      socket.on('connect', () => {
        socket.end();
        resolve();
      });
      socket.on('error', reject);
    });
  });
});

test('HTTP で稼働状態(JSON)を返す', async () => {
  await withServer(async (port) => {
    const body = await new Promise((resolve, reject) => {
      get({ host: '127.0.0.1', port, path: '/' }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
    assert.deepEqual(JSON.parse(body), { status: 'ok', service: '@app/db' });
  });
});
