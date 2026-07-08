// @nestjs/throttler の ThrottlerStorage を Durable Objects で実装するアダプタ(ADR 20260604)。
// キー(rl:apikey:<keyId>、api-key-throttler.guard.ts)をそのまま DO の名前解決に使い、
// 1 APIキー = 1 DO インスタンスに対応させる(キー単位の厳密カウント)。
import type { ThrottlerStorage } from '@nestjs/throttler';
import type { ApiKeyRateLimiterNamespace } from './rate-limiter-namespace';

export class DurableObjectThrottlerStorage implements ThrottlerStorage {
	constructor(private readonly namespace: ApiKeyRateLimiterNamespace) {}

	async increment(key: string, ttl: number, limit: number, blockDuration: number) {
		const stub = this.namespace.get(this.namespace.idFromName(key));
		const decision = await stub.increment(ttl, limit, blockDuration);
		return {
			totalHits: decision.totalHits,
			timeToExpire: decision.timeToExpireSeconds,
			isBlocked: decision.isBlocked,
			timeToBlockExpire: decision.timeToBlockExpireSeconds
		};
	}
}
