// カーソルページングの不透明カーソル(api/01-graphql-internal.md §3、db §6)。
// 一覧は (updated_at desc, id desc) のキーセットで進める(idx_profiles_visibility_updated)。
// カーソルは並び替えキー(updatedAt + ULID id)を base64url で不透明エンコードし、消費側に構造を解釈させない。
import { BadRequestError } from './errors';

export interface ProfileCursor {
  /** ISO-8601(UTC)。updated_at の並び替えキー。 */
  readonly updatedAt: string;
  /** ULID。同一 updatedAt の安定したタイブレーク。 */
  readonly id: string;
}

function toBase64Url(json: string): string {
  return Buffer.from(json, 'utf8').toString('base64url');
}

function fromBase64Url(cursor: string): string {
  return Buffer.from(cursor, 'base64url').toString('utf8');
}

export function encodeCursor(cursor: ProfileCursor): string {
  return toBase64Url(JSON.stringify({ u: cursor.updatedAt, i: cursor.id }));
}

export function decodeCursor(cursor: string): ProfileCursor {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fromBase64Url(cursor));
  } catch {
    throw new BadRequestError('カーソルが不正です。');
  }
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).u !== 'string' ||
    typeof (parsed as Record<string, unknown>).i !== 'string'
  ) {
    throw new BadRequestError('カーソルが不正です。');
  }
  const record = parsed as { u: string; i: string };
  return { updatedAt: record.u, id: record.i };
}
