// APIキー単位レート制限DOの最小インターフェース(Frameworks & Drivers)。
// 具象DOクラス(api-key-rate-limiter.do.ts)は cloudflare:workers を import するため、
// Workers専用tsconfig(tsconfig.worker.json)配下でのみ型解決できる。本ファイルを介する
// ProfileModule/workers-runtime.ts はローカル/dev(main.ts、通常のtsconfig.json)からも
// 型検査されるため、具象クラス型(DurableObjectNamespace<ApiKeyRateLimiterDurableObject>)に
// 依存せず、構造的に互換な最小インターフェースのみを参照する
// (worker.ts が実際の env.API_KEY_RATE_LIMITER をこの型へ構造的に渡す)。
import type { DurableObjectId } from '@cloudflare/workers-types';
import type { RateLimitDecision } from '../../domain/rate-limit-window';

export interface ApiKeyRateLimiterStub {
	increment(windowMs: number, limit: number, blockDurationMs: number): Promise<RateLimitDecision>;
}

export interface ApiKeyRateLimiterNamespace {
	idFromName(name: string): DurableObjectId;
	get(id: DurableObjectId): ApiKeyRateLimiterStub;
}
