// スコープ認可ガード(Interface Adapters / 認可の第 2 段、coding/04-nestjs.md §4.1)。
// ハンドラの @RequireScope('full') を読み、API キーのスコープが満たすか判定する(BR-API-001b)。
// read キーで書き込みハンドラを呼ぶと 403(スコープ外操作、AC-API-011b)。
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyScope, assertWriteScope } from '../../../domain/api-key';
import { ForbiddenError } from '../../../domain/errors';
import { ApiPrincipal } from '../../../application/models';
import { PRINCIPAL_REQUEST_KEY, REQUIRED_SCOPE_KEY } from '../decorators/principal.decorator';

interface ScopedRequest {
	[PRINCIPAL_REQUEST_KEY]?: ApiPrincipal;
}

@Injectable()
export class ApiScopeGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const required = this.reflector.getAllAndOverride<ApiKeyScope | undefined>(REQUIRED_SCOPE_KEY, [
			context.getHandler(),
			context.getClass()
		]);
		// 要求スコープ未指定(read 系)は認証済みなら通過。
		if (required !== ApiKeyScope.FULL) {
			return true;
		}

		const req = context.switchToHttp().getRequest<ScopedRequest>();
		const principal = req[PRINCIPAL_REQUEST_KEY];
		if (!principal) {
			// 認証ガードが先に動く前提。万一未設定なら権限なしとして扱う。
			throw new ForbiddenError('この操作を行う権限がありません。');
		}
		// full スコープを満たさなければ ForbiddenError(403 写像は例外フィルタ)。
		assertWriteScope(principal.scope);
		return true;
	}
}
