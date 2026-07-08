import { applyRateLimitHit, INITIAL_RATE_LIMIT_WINDOW_STATE } from './rate-limit-window';

describe('rate-limit-window(APIキー単位レート制限のスライディングウィンドウ判定)', () => {
	const WINDOW_MS = 60_000;
	const LIMIT = 60;
	const BLOCK_MS = WINDOW_MS;

	test('初回ヒットはブロックされず、残量計算の元になる totalHits=1 を返す', () => {
		// Arrange
		const now = 1_000_000;

		// Act
		const { decision } = applyRateLimitHit(
			INITIAL_RATE_LIMIT_WINDOW_STATE,
			now,
			WINDOW_MS,
			LIMIT,
			BLOCK_MS
		);

		// Assert
		expect(decision).toEqual({
			totalHits: 1,
			timeToExpireSeconds: 60,
			isBlocked: false,
			timeToBlockExpireSeconds: 0
		});
	});

	test('上限ちょうど(60回目)まではブロックされない', () => {
		// Arrange
		let state = INITIAL_RATE_LIMIT_WINDOW_STATE;
		const now = 1_000_000;

		// Act
		for (let i = 0; i < LIMIT; i += 1) {
			const result = applyRateLimitHit(state, now, WINDOW_MS, LIMIT, BLOCK_MS);
			state = result.state;
			if (i === LIMIT - 1) {
				// Assert(最後のヒット=60回目)
				expect(result.decision.totalHits).toBe(60);
				expect(result.decision.isBlocked).toBe(false);
			}
		}
	});

	test('上限を超えた61回目は429相当(isBlocked=true)になりRetry-After用の残秒数を返す', () => {
		// Arrange
		let state = INITIAL_RATE_LIMIT_WINDOW_STATE;
		const now = 1_000_000;
		for (let i = 0; i < LIMIT; i += 1) {
			state = applyRateLimitHit(state, now, WINDOW_MS, LIMIT, BLOCK_MS).state;
		}

		// Act
		const { decision } = applyRateLimitHit(state, now, WINDOW_MS, LIMIT, BLOCK_MS);

		// Assert
		expect(decision.isBlocked).toBe(true);
		expect(decision.totalHits).toBe(61);
		expect(decision.timeToBlockExpireSeconds).toBe(60);
	});

	test('ブロック中は再ヒットしても totalHits・ブロック期限が変化しない(棄却され続ける)', () => {
		// Arrange
		let state = INITIAL_RATE_LIMIT_WINDOW_STATE;
		const blockedAt = 1_000_000;
		for (let i = 0; i < LIMIT; i += 1) {
			state = applyRateLimitHit(state, blockedAt, WINDOW_MS, LIMIT, BLOCK_MS).state;
		}
		const blockedResult = applyRateLimitHit(state, blockedAt, WINDOW_MS, LIMIT, BLOCK_MS);
		state = blockedResult.state;

		// Act(ブロック期間内の少し後に再度ヒット)
		const retryAt = blockedAt + 10_000;
		const { decision } = applyRateLimitHit(state, retryAt, WINDOW_MS, LIMIT, BLOCK_MS);

		// Assert
		expect(decision.isBlocked).toBe(true);
		expect(decision.totalHits).toBe(61);
		expect(decision.timeToBlockExpireSeconds).toBe(50);
	});

	test('ブロック解除後は再び成功し、カウントが1からやり直される(AC-API-014)', () => {
		// Arrange
		let state = INITIAL_RATE_LIMIT_WINDOW_STATE;
		const blockedAt = 1_000_000;
		for (let i = 0; i < LIMIT; i += 1) {
			state = applyRateLimitHit(state, blockedAt, WINDOW_MS, LIMIT, BLOCK_MS).state;
		}
		state = applyRateLimitHit(state, blockedAt, WINDOW_MS, LIMIT, BLOCK_MS).state;

		// Act(ブロック期限ちょうど経過後)
		const afterBlock = blockedAt + BLOCK_MS;
		const { decision } = applyRateLimitHit(state, afterBlock, WINDOW_MS, LIMIT, BLOCK_MS);

		// Assert
		expect(decision.isBlocked).toBe(false);
		expect(decision.totalHits).toBe(1);
	});

	test('スライディングウィンドウ: 古いヒットはウィンドウ経過後に計上から除外される', () => {
		// Arrange(t=0 で1回ヒット)
		const first = applyRateLimitHit(INITIAL_RATE_LIMIT_WINDOW_STATE, 0, WINDOW_MS, LIMIT, BLOCK_MS);

		// Act(ウィンドウちょうど経過後に2回目のヒット)
		const { decision } = applyRateLimitHit(first.state, WINDOW_MS, WINDOW_MS, LIMIT, BLOCK_MS);

		// Assert(古いヒットは除外され、直近ヒットの1件のみ計上される)
		expect(decision.totalHits).toBe(1);
	});
});
