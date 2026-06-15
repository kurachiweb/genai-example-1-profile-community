import {
	BadRequestError,
	DomainError,
	ErrorCode,
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
	ValidationError,
	httpStatusForCode
} from './errors';

describe('errors(ドメイン例外とコード写像)', () => {
	describe('httpStatusForCode(BR-API-011 の対称写像)', () => {
		test('各コードを規定の HTTP ステータスへ写像する', () => {
			expect(httpStatusForCode(ErrorCode.BAD_REQUEST)).toBe(400);
			expect(httpStatusForCode(ErrorCode.UNAUTHORIZED)).toBe(401);
			expect(httpStatusForCode(ErrorCode.FORBIDDEN)).toBe(403);
			expect(httpStatusForCode(ErrorCode.NOT_FOUND)).toBe(404);
			expect(httpStatusForCode(ErrorCode.VALIDATION_ERROR)).toBe(422);
			expect(httpStatusForCode(ErrorCode.RATE_LIMITED)).toBe(429);
			expect(httpStatusForCode(ErrorCode.INTERNAL_ERROR)).toBe(500);
		});
	});

	describe('各例外のコード・instanceof・httpStatus', () => {
		test('ValidationError は VALIDATION_ERROR(422)で details を保持する', () => {
			const error = new ValidationError('検証エラー', [{ field: 'bio', message: '長すぎます' }]);
			expect(error).toBeInstanceOf(DomainError);
			expect(error).toBeInstanceOf(ValidationError);
			expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
			expect(error.httpStatus).toBe(422);
			expect(error.details).toEqual([{ field: 'bio', message: '長すぎます' }]);
		});

		test('NotFoundError は NOT_FOUND(404)', () => {
			const error = new NotFoundError();
			expect(error.code).toBe(ErrorCode.NOT_FOUND);
			expect(error.httpStatus).toBe(404);
		});

		test('ForbiddenError は FORBIDDEN(403)', () => {
			expect(new ForbiddenError().httpStatus).toBe(403);
		});

		test('UnauthorizedError は UNAUTHORIZED(401)', () => {
			expect(new UnauthorizedError().httpStatus).toBe(401);
		});

		test('BadRequestError は BAD_REQUEST(400)', () => {
			expect(new BadRequestError().httpStatus).toBe(400);
		});
	});
});
