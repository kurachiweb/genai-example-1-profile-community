// 閲覧者(Viewer)の解決。client BFF(Next.js サーバー)が HttpOnly Cookie から取り出した
// セッション ID をヘッダ `x-user-session` で転送する。api は Cookie を用いないため CSRF 面を構造的に縮小する
// (security/01 §1)。CSRF 対策の正本は Cookie を持つ client 側に置く。
import { Inject, Injectable } from '@nestjs/common';
import {
	USER_SESSION_STORE,
	type UserSessionStore
} from '../../infrastructure/user-session.store';
import { USER_REPOSITORY, type UserRepository } from '../../application/gateways';
import { Viewer } from '../../application/models';

export interface RequestLike {
	readonly headers?: Record<string, string | string[] | undefined>;
}

function headerValue(req: RequestLike | undefined, name: string): string | undefined {
	const value = req?.headers?.[name];
	return Array.isArray(value) ? value[0] : value;
}

@Injectable()
export class ViewerProvider {
	constructor(
		@Inject(USER_SESSION_STORE) private readonly sessions: UserSessionStore,
		@Inject(USER_REPOSITORY) private readonly users: UserRepository
	) {}

	async resolve(req: RequestLike | undefined): Promise<Viewer | null> {
		const sessionId = headerValue(req, 'x-user-session');
		if (!sessionId) return null;

		const session = await this.sessions.resolve(sessionId);
		if (!session) return null;

		const user = await this.users.findById(session.userId);
		return user ? { userId: user.id, status: user.status } : null;
	}
}
