// API キー認証ガード(Interface Adapters / 横断・認可の第 1 段、coding/04-nestjs.md §4.1)。
// Authorization: Bearer <key> を受け取り、ハッシュ照合で有効キーを引き当てる(BR-API-001)。
// キーが失効・無効、または所有者が ACTIVE でない場合は 401(BR-API-002/003・BR-COMMON-005)。
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { isActiveApiKey } from '../../../domain/api-key';
import { UnauthorizedError } from '../../../domain/errors';
import { UserStatus } from '../../../domain/user-status';
import {
	API_KEY_REPOSITORY,
	CLOCK,
	USER_REPOSITORY,
	type ApiKeyRepository,
	type Clock,
	type UserRepository
} from '../../../application/gateways';
import { ApiPrincipal } from '../../../application/models';
import { hashApiKey } from '../../../infrastructure/hashing';
import { PRINCIPAL_REQUEST_KEY } from '../decorators/principal.decorator';

interface AuthRequest {
	headers?: Record<string, string | string[] | undefined>;
	[PRINCIPAL_REQUEST_KEY]?: ApiPrincipal;
}

function extractBearerToken(header: string | string[] | undefined): string | null {
	const raw = Array.isArray(header) ? header[0] : header;
	if (!raw) {
		return null;
	}
	const match = /^Bearer\s+(.+)$/i.exec(raw.trim());
	return match ? match[1].trim() : null;
}

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
	constructor(
		@Inject(API_KEY_REPOSITORY) private readonly apiKeys: ApiKeyRepository,
		@Inject(USER_REPOSITORY) private readonly users: UserRepository,
		@Inject(CLOCK) private readonly clock: Clock
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest<AuthRequest>();
		const token = extractBearerToken(req.headers?.authorization);
		if (!token) {
			throw new UnauthorizedError('API キーが必要です(Authorization: Bearer)。');
		}

		// 受信キーは平文で扱わずハッシュで照合する(ログ・エラーにも出さない、BR-COMMON-014)。
		const key = await this.apiKeys.findByKeyHash(hashApiKey(token));
		if (!key || !isActiveApiKey(key.status)) {
			throw new UnauthorizedError('API キーが無効です。');
		}

		const owner = await this.users.findById(key.userId);
		// 凍結・退会ユーザーのキーは無効(本来は失効済みだが認証段階でも弾く、BR-API-003)。
		if (!owner || owner.status !== UserStatus.ACTIVE) {
			throw new UnauthorizedError('API キーが無効です。');
		}

		const principal: ApiPrincipal = {
			keyId: key.id,
			userId: key.userId,
			status: owner.status,
			scope: key.scope
		};
		req[PRINCIPAL_REQUEST_KEY] = principal;

		// 最終利用日時の記録は副作用。失敗してもリクエスト本体は止めない(BR-API-003)。
		void this.apiKeys.touchLastUsed(key.id, this.clock.now()).catch(() => undefined);
		return true;
	}
}
