// AdminSessionStore(Gateway)の実装。本番は Cloudflare KV(管理者用名前空間・分離)、
// ローカルは Valkey(docker compose の valkey サービス)で実装する(db §7・BR-COMMON-002)。
// 有効 8 時間・アイドルタイムアウト 30 分のスライディング方式(BR-COMMON-002)。
// アイドル分の失効は Valkey の EXPIRE に委ね、絶対 8h 上限のみ createdAt から都度判定する
// (アイドルタイムアウト(30分)< 絶対有効期限(8h)のため、EXPIRE だけでは 8h 上限を表現できない)。
// セッション ID はハッシュ化してキーに用いる(平文保存しない、BR-COMMON-014)。
import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import {
	ADMIN_SESSION_IDLE_TIMEOUT_SECONDS,
	ADMIN_SESSION_TTL_SECONDS
} from '../domain/admin-limits';
import { AdminSession, AdminSessionStore } from '../application/admin/gateways';
import type { Clock } from '../application/gateways';
import { hashToken } from './token-hash';
import type { ValkeyClient } from './valkey-client';

interface StoredSessionValue {
	adminId: string;
	csrfToken: string;
	createdAt: string;
}

function token(): string {
	return randomBytes(32).toString('base64url');
}

function keyFor(sessionId: string): string {
	// db §7 のキー設計(sess:admin:<hash>)に合わせ、利用者セッションと名前空間を分離する。
	return `sess:admin:${hashToken(sessionId)}`;
}

@Injectable()
export class ValkeyAdminSessionStore implements AdminSessionStore {
	constructor(
		private readonly client: ValkeyClient,
		private readonly clock: Clock
	) {}

	async create(adminId: string): Promise<AdminSession> {
		const now = this.clock.now();
		const sessionId = token();
		const value: StoredSessionValue = {
			adminId,
			csrfToken: token(),
			createdAt: now.toISOString()
		};
		await this.client.set(
			keyFor(sessionId),
			JSON.stringify(value),
			'EX',
			ADMIN_SESSION_IDLE_TIMEOUT_SECONDS
		);
		return {
			sessionId,
			adminId: value.adminId,
			csrfToken: value.csrfToken,
			createdAt: now,
			lastAccessAt: now
		};
	}

	async resolve(sessionId: string): Promise<AdminSession | null> {
		const raw = await this.client.get(keyFor(sessionId));
		if (!raw) return null;

		const stored = JSON.parse(raw) as StoredSessionValue;
		const createdAt = new Date(stored.createdAt);
		const now = this.clock.now();
		const ageSeconds = (now.getTime() - createdAt.getTime()) / 1000;
		if (ageSeconds > ADMIN_SESSION_TTL_SECONDS) {
			await this.client.del(keyFor(sessionId));
			return null;
		}
		// スライディング更新(アイドルタイムアウト分だけ TTL を延長する)。
		await this.client.expire(keyFor(sessionId), ADMIN_SESSION_IDLE_TIMEOUT_SECONDS);
		return {
			sessionId,
			adminId: stored.adminId,
			csrfToken: stored.csrfToken,
			createdAt,
			lastAccessAt: now
		};
	}

	async destroy(sessionId: string): Promise<void> {
		await this.client.del(keyFor(sessionId));
	}
}
