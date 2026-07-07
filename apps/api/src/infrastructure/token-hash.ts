// セッションID/トークンを Valkey のキーとして保存する前にハッシュ化する共通ユーティリティ。
// 平文の値をそのままキーにすると、ストアが漏洩した際に値を復元され、セッション乗っ取り等に
// 悪用され得るため、SHA-256 でハッシュ化してから保存する(BR-COMMON-014、db §7)。
import { createHash } from 'node:crypto';

export function hashToken(value: string): string {
	return createHash('sha256').update(value).digest('hex');
}
