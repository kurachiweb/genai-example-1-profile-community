// API キーのスコープ・状態のドメインモデル(BR-API-001b / BR-API-002 / ADR 20260605)。
// 公開 API 固有。スコープは発行時に 1 つ選択し発行後は変更不可(権限の暗黙昇格を防ぐ)。
import { ForbiddenError } from './errors';

// read: Read 系のみ。full: 上記に加え本人プロフィールの書き込み。
export const ApiKeyScope = {
	READ: 'read',
	FULL: 'full'
} as const;

export type ApiKeyScope = (typeof ApiKeyScope)[keyof typeof ApiKeyScope];

const API_KEY_SCOPE_VALUES: ReadonlySet<string> = new Set(Object.values(ApiKeyScope));

export function isApiKeyScope(value: string): value is ApiKeyScope {
	return API_KEY_SCOPE_VALUES.has(value);
}

// active: 認証に使える。revoked: 失効済み(以後 401、BR-API-003)。
export const ApiKeyStatus = {
	ACTIVE: 'active',
	REVOKED: 'revoked'
} as const;

export type ApiKeyStatus = (typeof ApiKeyStatus)[keyof typeof ApiKeyStatus];

export function isActiveApiKey(status: ApiKeyStatus): boolean {
	return status === ApiKeyStatus.ACTIVE;
}

/**
 * スコープが書き込み(Create/Update/Delete)を許可するか。
 * `full` のみ許可。`read` は読み取り専用(BR-API-001b)。
 */
export function canWriteWithScope(scope: ApiKeyScope): boolean {
	return scope === ApiKeyScope.FULL;
}

/**
 * 書き込み操作に必要なスコープを満たすか検証する。
 * `read` キーでの書き込みはスコープ外操作として 403(BR-API-011・AC-API-011b)。
 * @throws ForbiddenError 書き込みに必要な `full` を持たないとき。
 */
export function assertWriteScope(scope: ApiKeyScope): void {
	if (!canWriteWithScope(scope)) {
		throw new ForbiddenError('この操作には full スコープの API キーが必要です。');
	}
}
