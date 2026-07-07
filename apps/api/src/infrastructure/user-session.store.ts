// UserSessionStore(Gateway)の実装。本番は Cloudflare KV(利用者用名前空間・分離)、
// ローカルは Valkey(docker compose の valkey サービス)で実装する(db §7・BR-COMMON-001)。
// 有効 30 日のスライディング方式(BR-COMMON-001)。TTL 管理は Valkey の EXPIRE に委ねる。
// セッション ID はハッシュ化してキーに用いる(平文保存しない、BR-COMMON-014)。
import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { hashToken } from './token-hash';
import type { ValkeyClient } from './valkey-client';

export const USER_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 日

export interface UserSession {
	readonly sessionId: string;
	readonly userId: string;
}

export const USER_SESSION_STORE = Symbol('UserSessionStore');

export interface UserSessionStore {
	create(userId: string): Promise<UserSession>;
	resolve(sessionId: string): Promise<UserSession | null>;
	destroy(sessionId: string): Promise<void>;
}

interface StoredSessionValue {
	userId: string;
}

function token(): string {
	return randomBytes(32).toString('base64url');
}

function keyFor(sessionId: string): string {
	// db §7 のキー設計(sess:client:<hash>)に合わせ、管理者セッションと名前空間を分離する。
	return `sess:client:${hashToken(sessionId)}`;
}

@Injectable()
export class ValkeyUserSessionStore implements UserSessionStore {
	constructor(private readonly client: ValkeyClient) {}

	async create(userId: string): Promise<UserSession> {
		const sessionId = token();
		const value: StoredSessionValue = { userId };
		await this.client.set(keyFor(sessionId), JSON.stringify(value), 'EX', USER_SESSION_TTL_SECONDS);
		return { sessionId, userId };
	}

	async resolve(sessionId: string): Promise<UserSession | null> {
		const raw = await this.client.get(keyFor(sessionId));
		if (!raw) return null;

		const stored = JSON.parse(raw) as StoredSessionValue;
		// スライディング更新(TTL を延長する)。
		await this.client.expire(keyFor(sessionId), USER_SESSION_TTL_SECONDS);
		return { sessionId, userId: stored.userId };
	}

	async destroy(sessionId: string): Promise<void> {
		await this.client.del(keyFor(sessionId));
	}
}
