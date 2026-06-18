// 例外 → エラーコード → HTTP ステータス + 共通エンベロープへの対称写像(api/02 §4・BR-API-011)。
// ドメイン例外は意味のあるコードへ、Nest の HttpException(ルーティング 404 等)は一般化、
// 想定外の内部エラーは一般化して 500(詳細はログのみ、BR-COMMON-012/014)。
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { DomainError, ErrorCode, FieldError, httpStatusForCode } from '../../../domain/errors';

interface ErrorEnvelope {
	readonly success: false;
	readonly data: null;
	readonly error: {
		readonly code: ErrorCode;
		readonly message: string;
		readonly details: readonly FieldError[] | null;
	};
}

interface ResponseLike {
	status(code: number): ResponseLike;
	json(body: unknown): void;
}

// HTTP ステータス → コード/一般化メッセージ(秘匿のため Nest の生メッセージは使わない)。
const CODE_BY_STATUS: Record<number, { code: ErrorCode; message: string }> = {
	400: { code: ErrorCode.BAD_REQUEST, message: 'リクエストの形式が正しくありません。' },
	401: { code: ErrorCode.UNAUTHORIZED, message: '認証が必要です。' },
	403: { code: ErrorCode.FORBIDDEN, message: 'この操作を行う権限がありません。' },
	404: { code: ErrorCode.NOT_FOUND, message: '見つかりませんでした。' },
	422: { code: ErrorCode.VALIDATION_ERROR, message: '入力内容に誤りがあります。' },
	429: { code: ErrorCode.RATE_LIMITED, message: 'リクエストが多すぎます。' }
};

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(DomainExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const res = host.switchToHttp().getResponse<ResponseLike>();
		const envelope = this.toEnvelope(exception);
		res.status(httpStatusForCode(envelope.error.code)).json(envelope);
	}

	private toEnvelope(exception: unknown): ErrorEnvelope {
		// 1) ドメイン例外: コード・メッセージ・詳細をそのまま用いる。
		if (exception instanceof DomainError) {
			return {
				success: false,
				data: null,
				error: {
					code: exception.code,
					message: exception.message,
					details: exception.details ?? null
				}
			};
		}

		// 2) Nest の HttpException: ステータスから一般化したコード/メッセージへ写像。
		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const mapped = CODE_BY_STATUS[status] ?? {
				code: ErrorCode.INTERNAL_ERROR,
				message: 'サーバー内部でエラーが発生しました。'
			};
			return { success: false, data: null, error: { ...mapped, details: null } };
		}

		// 3) 想定外: 詳細はログのみ、応答は一般化(秘匿、BR-COMMON-012/014)。
		this.logger.error(
			'未処理の内部エラー',
			exception instanceof Error ? exception.stack : String(exception)
		);
		return {
			success: false,
			data: null,
			error: {
				code: ErrorCode.INTERNAL_ERROR,
				message: 'サーバー内部でエラーが発生しました。',
				details: null
			}
		};
	}
}
