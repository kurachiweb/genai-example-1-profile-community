// db コンテナのエントリポイント。compose の command から `pnpm run dev` で起動する。
import { startDevServer, DEFAULT_PORT } from './dev-server.js';

const port = Number(process.env.DB_DEV_PORT) || DEFAULT_PORT;
const server = await startDevServer({ port });

const { address, port: boundPort } = server.address();
console.log(`[@app/db] dev server listening on ${address}:${boundPort}`);

// compose stop / Ctrl-C で即座に終了し、停止遅延や再起動ループを防ぐ。
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
