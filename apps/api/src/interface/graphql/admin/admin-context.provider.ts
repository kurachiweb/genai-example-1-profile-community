// 管理者の操作主体を解決する。admin BFF(Next.js サーバー)が HttpOnly Cookie から取り出した
// セッション ID をヘッダ `x-admin-session` で転送する。api は Cookie を用いないため CSRF 面を構造的に縮小する
// (security/01 §1)。CSRF 対策の正本は Cookie を持つ admin 側に置く。
import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedError } from '../../../domain/errors';
import { AdminAuthService } from '../../../application/admin/admin-auth.service';
import { AdminPrincipal } from '../../../application/admin/models';

export interface RequestLike {
	readonly headers?: Record<string, string | string[] | undefined>;
}

function headerValue(req: RequestLike | undefined, name: string): string | undefined {
	const value = req?.headers?.[name];
	return Array.isArray(value) ? value[0] : value;
}

@Injectable()
export class AdminContextProvider {
	constructor(@Inject(AdminAuthService) private readonly auth: AdminAuthService) {}

	sessionId(req: RequestLike | undefined): string | undefined {
		return headerValue(req, 'x-admin-session');
	}

	async requirePrincipal(req: RequestLike | undefined): Promise<AdminPrincipal> {
		const resolved = await this.auth.resolvePrincipal(this.sessionId(req));
		if (!resolved) {
			throw new UnauthorizedError('管理者としてログインしてください。');
		}
		return resolved.principal;
	}
}
