// Cloudflare KV を ValkeyClient インターフェースの実装として提供するアダプタ(Frameworks & Drivers)。
// 既存の ValkeyXxxStore(ValkeyUserSessionStore 等)は ValkeyClient にのみ依存するため、
// 本番(Workers)では本アダプタを注入するだけでコードの変更なく KV バックエンドへ差し替えられる。
// KV は Valkey/Redis と異なり「TTLだけ更新」「取得と削除を原子的に行う」ネイティブ操作を持たないため、
// get→put/delete の組み合わせで近似する(整合性要件が緩いセッション/ワンタイムトークン用途では許容範囲)。
import type { KVNamespace } from '@cloudflare/workers-types';
import type { ValkeyClient } from './valkey-client';

export function createKVValkeyClient(namespace: KVNamespace): ValkeyClient {
	return {
		async get(key) {
			return namespace.get(key);
		},
		async set(key, value, _mode, seconds) {
			await namespace.put(key, value, { expirationTtl: seconds });
			return 'OK';
		},
		async del(key) {
			await namespace.delete(key);
			return 1;
		},
		async expire(key, seconds) {
			// KVにはTTLのみ更新するネイティブ操作が無いため、値を読み直して同じ内容で put し直す。
			const value = await namespace.get(key);
			if (value === null) return 0;
			await namespace.put(key, value, { expirationTtl: seconds });
			return 1;
		},
		async getdel(key) {
			const value = await namespace.get(key);
			if (value === null) return null;
			await namespace.delete(key);
			return value;
		},
		async quit() {
			return 'OK';
		}
	};
}
