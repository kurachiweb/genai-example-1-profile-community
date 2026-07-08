// OpenNext(Cloudflare)設定。ISR/Data CacheのバックエンドはR2(ADR 20260708、`@opennextjs/cloudflare`
// の現行公式デフォルトに追従。KV実装も同梱されているが本プロジェクトでは採用しない)。
import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';

export default defineCloudflareConfig({
	incrementalCache: r2IncrementalCache
});
