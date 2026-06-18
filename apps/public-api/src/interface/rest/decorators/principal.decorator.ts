// 認証済み API キー保持者(ApiPrincipal)とスコープ要件を扱う横断デコレータ(Interface Adapters)。
import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { ApiKeyScope } from '../../../domain/api-key';
import { ApiPrincipal } from '../../../application/models';

/** 認証ガードが request に載せた principal を受け取るキー。 */
export const PRINCIPAL_REQUEST_KEY = 'apiPrincipal';

interface RequestWithPrincipal {
	[PRINCIPAL_REQUEST_KEY]?: ApiPrincipal;
}

/** ハンドラ引数に認証済み ApiPrincipal を注入する(@Principal())。 */
export const Principal = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): ApiPrincipal | undefined => {
		const req = ctx.switchToHttp().getRequest<RequestWithPrincipal>();
		return req[PRINCIPAL_REQUEST_KEY];
	}
);

/** 当該ハンドラが要求するスコープ(未指定なら read 相当=認証のみ)を示すメタデータキー。 */
export const REQUIRED_SCOPE_KEY = 'requiredScope';

/** 書き込み系ハンドラに必要スコープを宣言する(@RequireScope('full'))。 */
export const RequireScope = (scope: ApiKeyScope) => SetMetadata(REQUIRED_SCOPE_KEY, scope);
