// プロフィール内容フィールドの検証・正規化(BR-PROF-002/005/006)。
// 提供されたフィールドのみを検証する(PATCH 的な部分更新に対応)。氏名は提供時に必須(空は不可、AC-PROF-008)。
import { NameDisplayOrder } from './display-name';
import { FieldError, ValidationError } from './errors';
import { countGraphemes } from './grapheme';
import { BIO_MAX_GRAPHEMES, NAME_MAX_GRAPHEMES, OCCUPATION_MAX_GRAPHEMES } from './limits';
import { normalizeText } from './text';

export interface ProfileContentInput {
	readonly firstName?: string;
	readonly lastName?: string;
	readonly nameDisplayOrder?: string;
	readonly occupation?: string | null;
	readonly bio?: string | null;
}

export interface NormalizedProfileContent {
	firstName?: string;
	lastName?: string;
	nameDisplayOrder?: NameDisplayOrder;
	occupation?: string | null;
	bio?: string | null;
}

const NAME_DISPLAY_ORDER_VALUES: ReadonlySet<string> = new Set(Object.values(NameDisplayOrder));

function validateRequiredName(
	value: string,
	field: 'firstName' | 'lastName',
	details: FieldError[]
): string {
	const normalized = normalizeText(value);
	if (normalized.length === 0) {
		details.push({ field, message: '必須項目です。' });
	} else if (countGraphemes(normalized) > NAME_MAX_GRAPHEMES) {
		details.push({ field, message: `最大 ${NAME_MAX_GRAPHEMES} 文字です。` });
	}
	return normalized;
}

function validateOptionalText(
	value: string | null,
	field: 'occupation' | 'bio',
	maxGraphemes: number,
	allowNewlines: boolean,
	details: FieldError[]
): string | null {
	const normalized = normalizeText(value ?? '', { allowNewlines });
	if (normalized.length === 0) {
		return null;
	}
	if (countGraphemes(normalized) > maxGraphemes) {
		details.push({ field, message: `最大 ${maxGraphemes} 文字です。` });
	}
	return normalized;
}

/**
 * プロフィール内容を検証・正規化する。提供されたキーのみ結果に含める。
 * @throws ValidationError いずれかのフィールドが規則違反のとき(details にフィールド別エラー)。
 */
export function validateProfileContent(input: ProfileContentInput): NormalizedProfileContent {
	const details: FieldError[] = [];
	const result: NormalizedProfileContent = {};

	if (input.firstName !== undefined) {
		result.firstName = validateRequiredName(input.firstName, 'firstName', details);
	}
	if (input.lastName !== undefined) {
		result.lastName = validateRequiredName(input.lastName, 'lastName', details);
	}
	if (input.nameDisplayOrder !== undefined) {
		if (!NAME_DISPLAY_ORDER_VALUES.has(input.nameDisplayOrder)) {
			details.push({ field: 'nameDisplayOrder', message: '表示順の指定が不正です。' });
		} else {
			result.nameDisplayOrder = input.nameDisplayOrder as NameDisplayOrder;
		}
	}
	if (input.occupation !== undefined) {
		result.occupation = validateOptionalText(
			input.occupation,
			'occupation',
			OCCUPATION_MAX_GRAPHEMES,
			false,
			details
		);
	}
	if (input.bio !== undefined) {
		result.bio = validateOptionalText(input.bio, 'bio', BIO_MAX_GRAPHEMES, true, details);
	}

	if (details.length > 0) {
		throw new ValidationError('プロフィールの入力に誤りがあります。', details);
	}
	return result;
}
