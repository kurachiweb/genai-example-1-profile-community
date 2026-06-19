// WebauthnChallengeStore(Gateway)の実装。チャレンジは短命・ワンタイム(db §7)。
// 本番は Cloudflare KV、ローカルはインメモリ(TTL 付き)で実装する。
import { Injectable } from '@nestjs/common';
import { WEBAUTHN_CHALLENGE_TTL_SECONDS } from '../domain/admin-limits';
import { WebauthnChallengeStore } from '../application/admin/gateways';
import type { Clock } from '../application/gateways';

interface StoredChallenge {
	challenge: string;
	expiresAt: number;
}

@Injectable()
export class InMemoryWebauthnChallengeStore implements WebauthnChallengeStore {
	private readonly store = new Map<string, StoredChallenge>();

	constructor(private readonly clock: Clock) {}

	async put(key: string, challenge: string): Promise<void> {
		this.store.set(key, {
			challenge,
			expiresAt: this.clock.now().getTime() + WEBAUTHN_CHALLENGE_TTL_SECONDS * 1000
		});
	}

	async take(key: string): Promise<string | null> {
		const stored = this.store.get(key);
		// ワンタイム: 取得時に必ず破棄する。
		this.store.delete(key);
		if (!stored || stored.expiresAt < this.clock.now().getTime()) {
			return null;
		}
		return stored.challenge;
	}
}
