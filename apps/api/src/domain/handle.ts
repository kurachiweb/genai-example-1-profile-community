// ハンドル名の形式検証・予約語(BR-SHARE-001 / BR-SHARE-002)。
// 予約語一覧の正本は本定数(features は本実装の設定を参照する、BR-SHARE-002)。
import { ValidationError } from './errors';

export const HANDLE_MIN_LENGTH = 3;
export const HANDLE_MAX_LENGTH = 30;

// 半角英小文字・数字・ハイフン。先頭/末尾ハイフン不可・連続ハイフン不可(BR-SHARE-001)。
export const HANDLE_PATTERN = /^[a-z0-9](?:-?[a-z0-9])*$/;

// 予約語(ルーティング衝突・公式詐称の防止、BR-SHARE-002)。小文字で保持し小文字比較する。
export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  'admin',
  'api',
  'login',
  'logout',
  'signup',
  'signin',
  'help',
  'about',
  'terms',
  'privacy',
  'settings',
  'p',
  'search',
  'me',
  'static',
  'assets',
  'public',
  'null',
  'undefined',
  'root',
  'support',
]);

export function isReservedHandle(handle: string): boolean {
  return RESERVED_HANDLES.has(handle.toLowerCase());
}

export function isValidHandleFormat(handle: string): boolean {
  if (handle.length < HANDLE_MIN_LENGTH || handle.length > HANDLE_MAX_LENGTH) {
    return false;
  }
  return HANDLE_PATTERN.test(handle);
}

/**
 * 設定可能なハンドルか検証する(形式 + 予約語)。一意性は永続層(UNIQUE 制約)で担保する。
 * @throws ValidationError 形式違反・予約語のとき(field='handle')。
 */
export function assertAssignableHandle(handle: string): void {
  if (!isValidHandleFormat(handle)) {
    throw new ValidationError('ハンドルは半角英小文字・数字・ハイフンの 3〜30 文字で指定してください。', [
      { field: 'handle', message: '形式が正しくありません(先頭/末尾・連続のハイフンは不可)。' },
    ]);
  }
  if (isReservedHandle(handle)) {
    throw new ValidationError('このハンドルは使用できません。', [
      { field: 'handle', message: '予約語のため使用できません。' },
    ]);
  }
}
