// WebauthnChallengeStore(Gateway)の実装。チャレンジは短命・ワンタイム(db §7)。
// 本番は Cloudflare KV、ローカルは Valkey(docker compose の valkey サービス)で実装する。
// TTL・ワンタイム消費のいずれも Valkey ネイティブの機能(EX/GETDEL)に委ねる。
import { Injectable } from '@nestjs/common';
import { WEBAUTHN_CHALLENGE_TTL_SECONDS } from '../domain/admin-limits';
import { WebauthnChallengeStore } from '../application/admin/gateways';
import type { ValkeyClient } from './valkey-client';

function keyFor(key: string): string {
	// db §7 のキー設計(tok:webauthn:...)に合わせる。
	return `tok:webauthn:${key}`;
}

@Injectable()
export class ValkeyWebauthnChallengeStore implements WebauthnChallengeStore {
	constructor(private readonly client: ValkeyClient) {}

	async put(key: string, challenge: string): Promise<void> {
		await this.client.set(keyFor(key), challenge, 'EX', WEBAUTHN_CHALLENGE_TTL_SECONDS);
	}

	async take(key: string): Promise<string | null> {
		// GETDEL で取得と破棄を原子的に行う(ワンタイム)。
		return this.client.getdel(keyFor(key));
	}
}
