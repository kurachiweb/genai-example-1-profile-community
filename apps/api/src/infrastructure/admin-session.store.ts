// AdminSessionStore(Gateway)の実装。本番は Cloudflare KV(管理者用名前空間・分離)、
// ローカルはインメモリ(プロセス内・KV 相当)で実装する(db §7・BR-COMMON-002)。
// 有効 8 時間・アイドルタイムアウト 30 分のスライディング方式(BR-COMMON-002)。
import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import {
	ADMIN_SESSION_IDLE_TIMEOUT_SECONDS,
	ADMIN_SESSION_TTL_SECONDS
} from '../domain/admin-limits';
import { AdminSession, AdminSessionStore } from '../application/admin/gateways';
import type { Clock } from '../application/gateways';

interface StoredSession {
	adminId: string;
	csrfToken: string;
	createdAt: Date;
	lastAccessAt: Date;
}

function token(): string {
	return randomBytes(32).toString('base64url');
}

@Injectable()
export class InMemoryAdminSessionStore implements AdminSessionStore {
	private readonly sessions = new Map<string, StoredSession>();

	constructor(private readonly clock: Clock) {}

	async create(adminId: string): Promise<AdminSession> {
		const now = this.clock.now();
		const sessionId = token();
		const stored: StoredSession = {
			adminId,
			csrfToken: token(),
			createdAt: now,
			lastAccessAt: now
		};
		this.sessions.set(sessionId, stored);
		return { sessionId, ...stored };
	}

	async resolve(sessionId: string): Promise<AdminSession | null> {
		const stored = this.sessions.get(sessionId);
		if (!stored) {
			return null;
		}
		const now = this.clock.now();
		const ageSeconds = (now.getTime() - stored.createdAt.getTime()) / 1000;
		const idleSeconds = (now.getTime() - stored.lastAccessAt.getTime()) / 1000;
		if (
			ageSeconds > ADMIN_SESSION_TTL_SECONDS ||
			idleSeconds > ADMIN_SESSION_IDLE_TIMEOUT_SECONDS
		) {
			this.sessions.delete(sessionId);
			return null;
		}
		// スライディング更新(最終アクセス時刻を進める)。
		stored.lastAccessAt = now;
		return { sessionId, ...stored };
	}

	async destroy(sessionId: string): Promise<void> {
		this.sessions.delete(sessionId);
	}
}
