// 共通レスポンスエンベロープ整形(Interface Adapters / Presenter 横断、api/02 §3・BR-COMMON-011)。
// 成功応答を一律 { success, data, error, meta } に包む。各コントローラで手組みしない。
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** 成功エンベロープの形(失敗時は例外フィルタが生成、api/02 §3)。 */
export interface SuccessEnvelope<T> {
	readonly success: true;
	readonly data: T;
	readonly error: null;
	readonly meta: Record<string, unknown> | null;
}

/** ページング等のメタを伴う応答をハンドラから返すためのキャリア。 */
export class Paginated<T> {
	constructor(
		readonly data: T,
		readonly meta: Record<string, unknown>
	) {}
}

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
	intercept(_context: ExecutionContext, next: CallHandler): Observable<SuccessEnvelope<unknown>> {
		return next.handle().pipe(
			map((value: unknown) => {
				if (value instanceof Paginated) {
					return { success: true, data: value.data, error: null, meta: value.meta };
				}
				return { success: true, data: value ?? null, error: null, meta: null };
			})
		);
	}
}
