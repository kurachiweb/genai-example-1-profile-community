// APIキー単位レート制限カウンタの Durable Object(Frameworks & Drivers、ADR 20260604)。
// DO は ID(= APIキーID)単位で単一インスタンス・単一スレッド・強整合のため、同一キーへの
// 同時リクエストも正確に逐次カウントできる。判定ロジック本体は domain/rate-limit-window.ts
// (純粋関数・ユニットテスト対象)に分離し、本クラスは Durable Object Storage への
// 読み書きのみを担う。NestJS/decorator に依存しないため esbuild(wrangler)で worker.ts に
// 直接バンドルでき、dist 経由(../dist/...)にする必要はない。
import { DurableObject } from 'cloudflare:workers';
import {
	applyRateLimitHit,
	INITIAL_RATE_LIMIT_WINDOW_STATE,
	type RateLimitDecision,
	type RateLimitWindowState
} from '../../domain/rate-limit-window';

const STATE_STORAGE_KEY = 'state';

export class ApiKeyRateLimiterDurableObject extends DurableObject {
	async increment(
		windowMs: number,
		limit: number,
		blockDurationMs: number
	): Promise<RateLimitDecision> {
		const now = Date.now();
		const current =
			(await this.ctx.storage.get<RateLimitWindowState>(STATE_STORAGE_KEY)) ??
			INITIAL_RATE_LIMIT_WINDOW_STATE;
		const { state, decision } = applyRateLimitHit(current, now, windowMs, limit, blockDurationMs);
		await this.ctx.storage.put(STATE_STORAGE_KEY, state);
		// ウィンドウ+ブロック分アイドルが続いたキーはストレージを掃除する(未アクセスDOの残存防止)。
		await this.ctx.storage.setAlarm(now + windowMs + blockDurationMs);
		return decision;
	}

	async alarm(): Promise<void> {
		await this.ctx.storage.deleteAll();
	}
}
