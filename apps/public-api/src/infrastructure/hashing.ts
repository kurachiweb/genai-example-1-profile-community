// API キーのハッシュ化(BR-API-001・BR-COMMON-014)。
// キー値は高エントロピーの乱数トークンのため、パスワード用の Argon2id ではなく
// Node 標準 crypto の SHA-256 で十分(辞書/総当たり耐性はエントロピー由来)。追加 npm 不要。
// 受信キー(Authorization: Bearer)を本関数でハッシュ化し、保存済み key_hash と照合する。
import { createHash } from 'node:crypto';

export function hashApiKey(rawKey: string): string {
	return createHash('sha256').update(rawKey, 'utf8').digest('hex');
}
