// UserSessionStore(Gateway)の実装。本番は Cloudflare KV(利用者用名前空間・分離)、
// ローカルはインメモリ(プロセス内・KV 相当)で実装する(db §7・BR-COMMON-001)。
// 有効 30 日のスライディング方式(BR-COMMON-001)。
import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { Clock } from '../application/gateways';

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

interface StoredSession {
	userId: string;
	createdAt: Date;
	lastAccessAt: Date;
}

function token(): string {
	return randomBytes(32).toString('base64url');
}

@Injectable()
export class InMemoryUserSessionStore implements UserSessionStore {
	private readonly sessions = new Map<string, StoredSession>();

	constructor(private readonly clock: Clock) {}

	async create(userId: string): Promise<UserSession> {
		const now = this.clock.now();
		const sessionId = token();
		this.sessions.set(sessionId, { userId, createdAt: now, lastAccessAt: now });
		return { sessionId, userId };
	}

	async resolve(sessionId: string): Promise<UserSession | null> {
		const stored = this.sessions.get(sessionId);
		if (!stored) return null;

		const now = this.clock.now();
		const ageSeconds = (now.getTime() - stored.createdAt.getTime()) / 1000;
		if (ageSeconds > USER_SESSION_TTL_SECONDS) {
			this.sessions.delete(sessionId);
			return null;
		}
		// スライディング更新。
		stored.lastAccessAt = now;
		return { sessionId, userId: stored.userId };
	}

	async destroy(sessionId: string): Promise<void> {
		this.sessions.delete(sessionId);
	}
}
