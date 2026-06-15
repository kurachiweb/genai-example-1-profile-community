import { ValidationError } from './errors';
import { isSnsPlatform, validateSnsLinks } from './sns-link';

describe('isSnsPlatform', () => {
  test('既知の種別を判定する', () => {
    expect(isSnsPlatform('github')).toBe(true);
    expect(isSnsPlatform('website')).toBe(true);
    expect(isSnsPlatform('unknown')).toBe(false);
  });
});

describe('validateSnsLinks(BR-PROF-007)', () => {
  test('正常系: 種別・https・ラベルを正規化し sortOrder を採番する', () => {
    const result = validateSnsLinks([
      { platform: 'github', url: 'https://github.com/example', label: '  ' },
      { platform: 'website', url: 'https://example.com', label: 'ポートフォリオ' },
    ]);
    expect(result[0]).toMatchObject({ platform: 'github', sortOrder: 0, label: null });
    expect(result[1]).toMatchObject({ platform: 'website', sortOrder: 1, label: 'ポートフォリオ' });
  });

  test('空配列は許可される(リンク 0 件)', () => {
    expect(validateSnsLinks([])).toEqual([]);
  });

  test('種別不正は ValidationError', () => {
    expect(() => validateSnsLinks([{ platform: 'myspace', url: 'https://example.com' }])).toThrow(
      ValidationError,
    );
  });

  test('javascript: スキームを拒否する(AC-PROF-014・XSS 防止)', () => {
    expect(() =>
      validateSnsLinks([{ platform: 'website', url: 'javascript:alert(1)' }]),
    ).toThrow(ValidationError);
  });

  test('パースできない URL を拒否する', () => {
    expect(() => validateSnsLinks([{ platform: 'website', url: 'not a url' }])).toThrow(ValidationError);
  });

  test('ラベル 31 文字は ValidationError(境界値)', () => {
    expect(() =>
      validateSnsLinks([{ platform: 'website', url: 'https://example.com', label: 'あ'.repeat(31) }]),
    ).toThrow(ValidationError);
  });

  test('詳細(details)に違反フィールドが index 付きで含まれる', () => {
    expect.assertions(1);
    try {
      validateSnsLinks([{ platform: 'website', url: 'http://example.com' }]);
    } catch (error) {
      expect((error as ValidationError).details?.[0]?.field).toBe('snsLinks[0].url');
    }
  });
});
