// 実効公開ゲート(BR-COMMON-007・最重要)。判定式は全機能で統一する。
//   effectivePublic = (visibility == public) AND (owner.status == ACTIVE)
// owner.status が UNVERIFIED/FROZEN/WITHDRAWN のときは public でも実効非公開(404 相当)。
import { UserStatus } from './user-status';

export const Visibility = {
  PUBLIC: 'public',
  PRIVATE: 'private',
} as const;

export type Visibility = (typeof Visibility)[keyof typeof Visibility];

export interface EffectivePublicInput {
  readonly visibility: Visibility;
  readonly ownerStatus: UserStatus;
}

export function effectivePublic({ visibility, ownerStatus }: EffectivePublicInput): boolean {
  return visibility === Visibility.PUBLIC && ownerStatus === UserStatus.ACTIVE;
}
