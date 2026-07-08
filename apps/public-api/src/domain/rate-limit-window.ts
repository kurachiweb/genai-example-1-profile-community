// APIキー単位レート制限のスライディングウィンドウ判定(純粋関数、Entities層)。
// 「直近 windowMs 内のヒット数」を正確に数えることで、固定ウィンドウ境界でのバースト超過を避ける
// (AC-API-013/AC-API-014、ADR 20260604)。Durable Objects(本番)実装から呼ばれる判定ロジック本体。
// ブロック中(直近超過分)は新規ヒットを計上せず、ブロック解除後に計上を再開する。

export interface RateLimitWindowState {
	/** 直近ウィンドウ内のヒット時刻(ms epoch)。古い順。 */
	readonly hitTimestamps: readonly number[];
	/** ブロック中の場合の解除時刻(ms epoch)。ブロックしていなければ 0。 */
	readonly blockedUntil: number;
}

export interface RateLimitDecision {
	readonly totalHits: number;
	readonly timeToExpireSeconds: number;
	readonly isBlocked: boolean;
	readonly timeToBlockExpireSeconds: number;
}

export const INITIAL_RATE_LIMIT_WINDOW_STATE: RateLimitWindowState = {
	hitTimestamps: [],
	blockedUntil: 0
};

export interface RateLimitHitResult {
	readonly state: RateLimitWindowState;
	readonly decision: RateLimitDecision;
}

/** 1 リクエストを計上し、次状態と判定結果を返す。 */
export function applyRateLimitHit(
	state: RateLimitWindowState,
	now: number,
	windowMs: number,
	limit: number,
	blockDurationMs: number
): RateLimitHitResult {
	if (state.blockedUntil > now) {
		// ブロック中は計上せず棄却し続ける(解除まで totalHits・ブロック期限は据え置き)。
		return {
			state,
			decision: {
				totalHits: state.hitTimestamps.length,
				timeToExpireSeconds: Math.ceil(windowMs / 1000),
				isBlocked: true,
				timeToBlockExpireSeconds: Math.ceil((state.blockedUntil - now) / 1000)
			}
		};
	}

	// ウィンドウ外に出た古いヒットを除去してから今回のヒットを計上する(スライディングウィンドウ)。
	const recentHits = state.hitTimestamps.filter((hitAt) => now - hitAt < windowMs);
	const hitTimestamps = [...recentHits, now];
	const totalHits = hitTimestamps.length;
	const oldestHit = hitTimestamps[0];
	const timeToExpireSeconds = Math.max(0, Math.ceil((oldestHit + windowMs - now) / 1000));

	if (totalHits > limit) {
		return {
			state: { hitTimestamps, blockedUntil: now + blockDurationMs },
			decision: {
				totalHits,
				timeToExpireSeconds,
				isBlocked: true,
				timeToBlockExpireSeconds: Math.ceil(blockDurationMs / 1000)
			}
		};
	}

	return {
		state: { hitTimestamps, blockedUntil: 0 },
		decision: { totalHits, timeToExpireSeconds, isBlocked: false, timeToBlockExpireSeconds: 0 }
	};
}
