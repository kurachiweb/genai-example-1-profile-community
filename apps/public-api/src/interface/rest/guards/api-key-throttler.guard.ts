// API キー単位レート制限ガード(Interface Adapters、coding/04-nestjs.md §6・api/02 §8)。
// 時間窓は BR-API-008(60 req/分/キー)を正本とし env から注入する。上限回数は管理画面(BR-ADMIN-008)が
// app_settings に書き込む値を毎リクエスト参照し、未設定時のみ env の既定値へフォールバックする
// (ApiKeyAuthGuard も認証のため毎リクエスト DB 参照しており、本ガードもそれに倣う)。本番はカウンタを
// Durable Objects で厳密化するが、ローカルは @nestjs/throttler の既定メモリストレージで同等の
// キー単位カウントを再現する(ADR 20260604)。全応答に RateLimit-* を付与し、超過時は 429+Retry-After。
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { RateLimitError } from '../../../domain/errors';
import { SETTINGS_REPOSITORY, type SettingsRepository } from '../../../application/gateways';
import { ApiPrincipal } from '../../../application/models';
import { PRINCIPAL_REQUEST_KEY } from '../decorators/principal.decorator';

/** レート制限の設定(env から解決)。DI トークンで guard へ渡す。 */
export const RATE_LIMIT_OPTIONS = Symbol('RateLimitOptions');

export interface RateLimitOptions {
	/** 時間窓(秒)。管理画面からは変更不可(BR-API-008)。 */
	readonly windowSeconds: number;
	/** 窓あたりの上限リクエスト数(キー単位)の既定値。app_settings 未設定時のフォールバック。 */
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
		@Inject(RATE_LIMIT_OPTIONS) private readonly options: RateLimitOptions,
		@Inject(SETTINGS_REPOSITORY) private readonly settings: SettingsRepository
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
		// 管理画面が変更するのは上限回数のみ(BR-ADMIN-008)。未設定なら env の既定値を使う。
		const configuredLimit = await this.settings.getApiRateLimitPerMinute();
		const limit = configuredLimit ?? this.options.limit;
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
