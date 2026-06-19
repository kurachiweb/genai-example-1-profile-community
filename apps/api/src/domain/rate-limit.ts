// 公開 API の全キー共通レート制限しきい値(BR-API-008 / BR-ADMIN-008)。
// 既定 60 リクエスト/分。管理者(super_admin)が変更でき、変更は監査ログに記録する。
import { ValidationError } from './errors';

/** 既定しきい値(BR-API-008・BR-COMMON-010)。 */
export const DEFAULT_API_RATE_LIMIT_PER_MINUTE = 60;

/** 受理する下限・上限。0 以下や過大値は誤設定として弾く(濫用・自滅防止)。 */
export const API_RATE_LIMIT_MIN_PER_MINUTE = 1;
export const API_RATE_LIMIT_MAX_PER_MINUTE = 10000;

export function isValidRateLimit(value: number): boolean {
	return (
		Number.isInteger(value) &&
		value >= API_RATE_LIMIT_MIN_PER_MINUTE &&
		value <= API_RATE_LIMIT_MAX_PER_MINUTE
	);
}

/** しきい値の妥当性を検証する。不正時は ValidationError。 */
export function assertValidRateLimit(value: number): void {
	if (!isValidRateLimit(value)) {
		throw new ValidationError(
			`レート制限のしきい値は ${API_RATE_LIMIT_MIN_PER_MINUTE}〜${API_RATE_LIMIT_MAX_PER_MINUTE} の整数で指定してください。`
		);
	}
}
