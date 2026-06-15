// User のアカウント状態モデルと許可遷移(COMMON-2 / docs/service/features/00-common-rules.md)。
// 状態列挙は features/ の S-USER-* 表記に一致させる。
import { ValidationError } from './errors';

export const UserStatus = {
  UNVERIFIED: 'UNVERIFIED',
  ACTIVE: 'ACTIVE',
  FROZEN: 'FROZEN',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// 許可遷移(COMMON-2 の状態遷移図)。WITHDRAWN は終端・復旧不可。
const ALLOWED_TRANSITIONS: Record<UserStatus, readonly UserStatus[]> = {
  UNVERIFIED: [UserStatus.ACTIVE, UserStatus.WITHDRAWN],
  ACTIVE: [UserStatus.FROZEN, UserStatus.WITHDRAWN],
  FROZEN: [UserStatus.ACTIVE, UserStatus.WITHDRAWN],
  WITHDRAWN: [],
};

export function canTransition(from: UserStatus, to: UserStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: UserStatus, to: UserStatus): void {
  if (!canTransition(from, to)) {
    throw new ValidationError(`状態 ${from} から ${to} へは遷移できません。`);
  }
}

/** 編集可能か(UNVERIFIED/ACTIVE/FROZEN はログイン可。WITHDRAWN は一切不可、BR-COMMON-005)。 */
export function canEditProfile(status: UserStatus): boolean {
  // FROZEN は編集不可(BR-COMMON-005)。WITHDRAWN は不可。UNVERIFIED/ACTIVE のみ編集可。
  return status === UserStatus.UNVERIFIED || status === UserStatus.ACTIVE;
}
