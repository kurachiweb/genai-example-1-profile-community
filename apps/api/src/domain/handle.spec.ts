import { ValidationError } from './errors';
import { assertAssignableHandle, isReservedHandle, isValidHandleFormat } from './handle';

describe('handle(BR-SHARE-001/002)', () => {
  describe('isValidHandleFormat(正常系)', () => {
    test('英小文字・数字・ハイフンの 3〜30 文字を許可する', () => {
      expect(isValidHandleFormat('minato-satonaka')).toBe(true);
      expect(isValidHandleFormat('abc')).toBe(true);
      expect(isValidHandleFormat('a1b2c3')).toBe(true);
    });
  });

  describe('isValidHandleFormat(異常系・境界値)', () => {
    test('2 文字以下・31 文字以上は不可', () => {
      expect(isValidHandleFormat('ab')).toBe(false);
      expect(isValidHandleFormat('a'.repeat(31))).toBe(false);
    });

    test('大文字・先頭/末尾ハイフン・連続ハイフンは不可', () => {
      expect(isValidHandleFormat('Abc')).toBe(false);
      expect(isValidHandleFormat('-foo')).toBe(false);
      expect(isValidHandleFormat('foo-')).toBe(false);
      expect(isValidHandleFormat('a--b')).toBe(false);
    });

    test('記号・空白・日本語は不可', () => {
      expect(isValidHandleFormat('foo_bar')).toBe(false);
      expect(isValidHandleFormat('foo bar')).toBe(false);
      expect(isValidHandleFormat('やまだ')).toBe(false);
    });
  });

  describe('isReservedHandle', () => {
    test('予約語(admin/api 等)を検出する(大文字小文字非依存)', () => {
      expect(isReservedHandle('admin')).toBe(true);
      expect(isReservedHandle('API')).toBe(true);
      expect(isReservedHandle('minato')).toBe(false);
    });
  });

  describe('assertAssignableHandle', () => {
    test('形式違反は ValidationError(field=handle)', () => {
      expect.assertions(2);
      try {
        assertAssignableHandle('a--b');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).details?.[0]?.field).toBe('handle');
      }
    });

    test('予約語は ValidationError', () => {
      expect(() => assertAssignableHandle('admin')).toThrow(ValidationError);
    });

    test('正当なハンドルは何も投げない', () => {
      expect(() => assertAssignableHandle('minato-satonaka')).not.toThrow();
    });
  });
});
