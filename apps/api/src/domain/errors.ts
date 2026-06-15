// ドメイン例外とエラーコード語彙。
// コード語彙は公開 REST(BR-API-011)と一致させ、内部 GraphQL の extensions.code とも対称に写像する
// (docs/GUIDES/api/00-overview.md §2.4)。HTTP 数値の正本は features/05-public-api.md §5(BR-API-011)。

export const ErrorCode = {
	BAD_REQUEST: 'BAD_REQUEST',
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	NOT_FOUND: 'NOT_FOUND',
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	RATE_LIMITED: 'RATE_LIMITED',
	INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** フィールド単位の検証エラー(BR-COMMON-008・error.details に対応)。 */
export interface FieldError {
	readonly field: string;
	readonly message: string;
}

/** コード → HTTP ステータスの対称写像(BR-API-011)。GraphQL では extensions.code を、REST では本ステータスを用いる。 */
const HTTP_STATUS_BY_CODE: Record<ErrorCode, number> = {
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	VALIDATION_ERROR: 422,
	RATE_LIMITED: 429,
	INTERNAL_ERROR: 500
};

export function httpStatusForCode(code: ErrorCode): number {
	return HTTP_STATUS_BY_CODE[code];
}

/**
 * ドメイン由来の想定済み例外。トランスポート(GraphQL/REST)はこれをコードへ対称に写像する。
 * 利用者向け message は日本語・一般化(情報漏えい防止、BR-COMMON-012)。
 */
export class DomainError extends Error {
	readonly code: ErrorCode;
	readonly details?: readonly FieldError[];

	constructor(code: ErrorCode, message: string, details?: readonly FieldError[]) {
		super(message);
		this.name = new.target.name;
		this.code = code;
		this.details = details;
		// TS の継承下で instanceof を機能させる。
		Object.setPrototypeOf(this, new.target.prototype);
	}

	get httpStatus(): number {
		return httpStatusForCode(this.code);
	}
}

/** ビジネスルール違反(文字数・形式・NSFW 等)。422。 */
export class ValidationError extends DomainError {
	constructor(message = '入力内容に誤りがあります。', details?: readonly FieldError[]) {
		super(ErrorCode.VALIDATION_ERROR, message, details);
	}
}

/** 不存在・秘匿(非公開/未確認/凍結/退会を一律に秘匿)。404。 */
export class NotFoundError extends DomainError {
	constructor(message = '見つかりませんでした。') {
		super(ErrorCode.NOT_FOUND, message);
	}
}

/** スコープ外・権限外・他者リソースへの書き込み。403。 */
export class ForbiddenError extends DomainError {
	constructor(message = 'この操作を行う権限がありません。') {
		super(ErrorCode.FORBIDDEN, message);
	}
}

/** 認証欠如・無効。401。 */
export class UnauthorizedError extends DomainError {
	constructor(message = 'ログインが必要です。') {
		super(ErrorCode.UNAUTHORIZED, message);
	}
}

/** 形式不正・パラメータ誤り(不正なカーソル等)。400。 */
export class BadRequestError extends DomainError {
	constructor(message = 'リクエストの形式が正しくありません。', details?: readonly FieldError[]) {
		super(ErrorCode.BAD_REQUEST, message, details);
	}
}
