import { NameDisplayOrder, buildDisplayName, buildSearchName } from './display-name';

describe('buildDisplayName(BR-PROF-003/004)', () => {
  test('givenNameFirst は 名→姓 で連結する(AC-PROF-006)', () => {
    expect(buildDisplayName('Maria', 'Garcia-Lopez', NameDisplayOrder.GIVEN_FIRST)).toBe(
      'Maria Garcia-Lopez',
    );
  });

  test('familyNameFirst は 姓→名 で連結する(AC-PROF-009)', () => {
    expect(buildDisplayName('みなと', '里中', NameDisplayOrder.FAMILY_FIRST)).toBe('里中 みなと');
  });

  test('二重空白・前後の余分な空白を生じさせない(AC-PROF-007)', () => {
    expect(buildDisplayName('  みなと  ', '  里中  ', NameDisplayOrder.FAMILY_FIRST)).toBe('里中 みなと');
  });

  test('片方が空のとき余分な空白を残さない', () => {
    expect(buildDisplayName('みなと', '', NameDisplayOrder.GIVEN_FIRST)).toBe('みなと');
    expect(buildDisplayName('', '里中', NameDisplayOrder.FAMILY_FIRST)).toBe('里中');
  });
});

describe('buildSearchName(BR-DISC-004)', () => {
  test('表示順で連結し NFC 正規化・小文字化する', () => {
    expect(buildSearchName('Maria', 'Garcia', NameDisplayOrder.GIVEN_FIRST)).toBe('maria garcia');
  });
});
