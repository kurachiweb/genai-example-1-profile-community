// グローバル ValidationPipe(coding/04-nestjs.md §4.2)。
// whitelist + forbidNonWhitelisted で未知プロパティを拒否し、transform で DTO へ変換する。
// class-validator の検証失敗はドメインの ValidationError へ写像し、例外フィルタで code を一貫させる。
import { ValidationPipe } from '@nestjs/common';
import type { ValidationError as ClassValidatorError } from 'class-validator';
import { FieldError, ValidationError } from '../../domain/errors';

function flatten(errors: ClassValidatorError[], parentPath = ''): FieldError[] {
	const result: FieldError[] = [];
	for (const error of errors) {
		const path = parentPath ? `${parentPath}.${error.property}` : error.property;
		if (error.constraints) {
			const message = Object.values(error.constraints)[0] ?? '入力が不正です。';
			result.push({ field: path, message });
		}
		if (error.children && error.children.length > 0) {
			result.push(...flatten(error.children, path));
		}
	}
	return result;
}

export function buildValidationPipe(): ValidationPipe {
	return new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
		// クエリ/パスのプリミティブも DTO 型へ変換する(limit 等の数値化)。
		transformOptions: { enableImplicitConversion: true },
		exceptionFactory: (errors) =>
			new ValidationError('入力内容に誤りがあります。', flatten(errors as ClassValidatorError[]))
	});
}
