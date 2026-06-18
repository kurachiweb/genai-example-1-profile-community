// API キー単位レート制限ガード(Interface Adapters、coding/04-nestjs.md §6・api/02 §8)。
// しきい値・時間窓は BR-API-008(60 req/分/キー)を正本とし env から注入する。本番はカウンタを
// Durable Objects で厳密化するが、ローカルは @nestjs/throttler の既定メモリストレージで同等の
// キー単位カウントを再現する(ADR 20260604)。全応答に RateLimit-* を付与し、超過時は 429+Retry-After。
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { RateLimitError } from '../../../domain/errors';
import { ApiPrincipal } from '../../../application/models';
import { PRINCIPAL_REQUEST_KEY } from '../decorators/principal.decorator';

/** レート制限の設定(env から解決)。DI トークンで guard へ渡す。 */
export const RATE_LIMIT_OPTIONS = Symbol('RateLimitOptions');

export interface RateLimitOptions {
	/** 時間窓(秒)。 */
	readonly windowSeconds: number;
	/** 窓あたりの上限リクエスト数(キー単位)。 */
	readonly limit: number;
}

interface ResponseLike {
	setHeader(name: string, value: string | number): void;
}

interface ThrottledRequest {
	[PRINCIPAL_REQUEST_KEY]?: ApiPrincipal;
}

@Injectable()
export class ApiKeyThrottlerGuard implements CanActivate {
	constructor(
		@Inject(ThrottlerStorage) private readonly storage: ThrottlerStorage,
		@Inject(RATE_LIMIT_OPTIONS) private readonly options: RateLimitOptions
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const http = context.switchToHttp();
		const req = http.getRequest<ThrottledRequest>();
		const res = http.getResponse<ResponseLike>();
		const principal = req[PRINCIPAL_REQUEST_KEY];
		// 認証ガードが先に動く前提。未認証(principal 無し)はここでは何もしない(認証ガードが 401)。
		if (!principal) {
			return true;
		}

		const ttlMs = this.options.windowSeconds * 1000;
		const limit = this.options.limit;
		// DO のキー設計 rl:apikey:<keyId> に合わせる(窓は storage の ttl が担う、db §7)。
		const key = `rl:apikey:${principal.keyId}`;
		const record = await this.storage.increment(key, ttlMs, limit, ttlMs, 'public-api');

		const remaining = Math.max(0, limit - record.totalHits);
		// 残量ヘッダ(AC-API-013)。標準ドラフト名 RateLimit-*(BR-API-008)。
		res.setHeader('RateLimit-Limit', limit);
		res.setHeader('RateLimit-Remaining', remaining);
		res.setHeader('RateLimit-Reset', record.timeToExpire);

		if (record.isBlocked) {
			// 超過時は Retry-After(秒)を添えて 429(AC-API-014)。
			res.setHeader('Retry-After', record.timeToBlockExpire || record.timeToExpire);
			throw new RateLimitError();
		}
		return true;
	}
}
