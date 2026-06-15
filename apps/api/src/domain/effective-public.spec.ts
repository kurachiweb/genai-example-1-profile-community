import { Visibility, effectivePublic } from './effective-public';
import { UserStatus } from './user-status';

describe('effectivePublic(BR-COMMON-007 実効公開ゲート)', () => {
  test('public かつ owner が ACTIVE のときのみ実効公開', () => {
    expect(effectivePublic({ visibility: Visibility.PUBLIC, ownerStatus: UserStatus.ACTIVE })).toBe(true);
  });

  test('private のときは owner が ACTIVE でも実効非公開', () => {
    expect(effectivePublic({ visibility: Visibility.PRIVATE, ownerStatus: UserStatus.ACTIVE })).toBe(false);
  });

  test.each([UserStatus.UNVERIFIED, UserStatus.FROZEN, UserStatus.WITHDRAWN])(
    'public でも owner が %s のときは実効非公開(404 相当)',
    (status) => {
      expect(effectivePublic({ visibility: Visibility.PUBLIC, ownerStatus: status })).toBe(false);
    },
  );
});
