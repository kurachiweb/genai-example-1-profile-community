import { decodeCursor, encodeCursor } from './cursor';
import { BadRequestError } from './errors';

describe('cursor(カーソルエンコード/デコード)', () => {
  const cursor = { updatedAt: '2026-06-15T00:00:00.000Z', id: '01J0ABCDEFGHJKMNPQRSTVWXYZ' };

  test('エンコード→デコードで元の値に戻る(可逆性)', () => {
    expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor);
  });

  test('出力は不透明で、生の id をそのまま含まない', () => {
    const encoded = encodeCursor(cursor);
    expect(encoded).not.toContain(cursor.id);
    expect(encoded).not.toContain(cursor.updatedAt);
  });

  test('不正なカーソルは BadRequestError(400)を投げる', () => {
    expect(() => decodeCursor('!!!not-base64!!!')).toThrow(BadRequestError);
    expect(() => decodeCursor(Buffer.from('{"foo":1}').toString('base64url'))).toThrow(BadRequestError);
  });
});
