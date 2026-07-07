// EmailVerificationTokenStore(Gateway)の実装。本番は Cloudflare KV、
// ローカルは Valkey(docker compose の valkey サービス)で実装する(db §7)。
// 有効 24h・ワンタイム。TTL・消費のいずれも Valkey ネイティブの機能(EX/GETDEL)に委ねる。
// トークンはハッシュ化してキーに用いる(平文保存しない、BR-COMMON-014)。
import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { EmailVerificationTokenStore } from '../application/user.service';
import { hashToken } from './token-hash';
import type { ValkeyClient } from './valkey-client';

type TokenType = 'verify' | 'reset' | 'change_email';

const TOKEN_TTL_SECONDS = 24 * 60 * 60; // 24 時間

// db §7 のキー設計(tok:verify:/tok:reset:/tok:email:)に合わせ、種別ごとに名前空間を分離する。
const KEY_PREFIX: Record<TokenType, string> = {
	verify: 'tok:verify:',
	reset: 'tok:reset:',
	change_email: 'tok:email:'
};

function keyFor(type: TokenType, token: string): string {
	return `${KEY_PREFIX[type]}${hashToken(token)}`;
}

interface StoredTokenValue {
	userId: string;
	extra?: string;
}

@Injectable()
export class ValkeyEmailVerificationTokenStore implements EmailVerificationTokenStore {
	constructor(private readonly client: ValkeyClient) {}

	async create(userId: string, type: TokenType, extra?: string): Promise<string> {
		const token = randomBytes(32).toString('base64url');
		const value: StoredTokenValue = { userId, extra };
		await this.client.set(keyFor(type, token), JSON.stringify(value), 'EX', TOKEN_TTL_SECONDS);
		return token;
	}

	async consume(
		token: string,
		type: TokenType
	): Promise<{ userId: string; extra?: string } | null> {
		// GETDEL で取得と破棄を原子的に行う(ワンタイム)。
		const raw = await this.client.getdel(keyFor(type, token));
		if (!raw) return null;

		const stored = JSON.parse(raw) as StoredTokenValue;
		return { userId: stored.userId, extra: stored.extra };
	}
}
