// PasswordHasher(Gateway)の実装。PBKDF2-HMAC-SHA256(Web Crypto API)でハッシュ化・検証する(BR-COMMON-003)。
// 元々は hash-wasm の Argon2id を使用していたが、hash-wasm は埋め込みWASMバイナリを
// 実行時に WebAssembly.compile() するため、Cloudflare Workers の実行時コード生成禁止制約
// (eval・new Function と同様に WASM の動的コンパイルも禁止される)に抵触し、
// 常に例外(catch されて false 扱い)となり、パスワードの正誤に関わらずログインが失敗していた
// (実機で "CompileError: Wasm code generation disallowed by embedder" を確認済み)。
// Web Crypto API(crypto.subtle)は Workers のネイティブ実装であり、この制約を受けない。
import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '../application/admin/gateways';

// Cloudflare Workers の crypto.subtle は PBKDF2 のイテレーション数上限が 100,000 に
// 制限されている(実機で "NotSupportedError: Pbkdf2 failed: iteration counts above 100000
// are not supported" を確認済み。`wrangler dev --local` のシミュレータではこの上限が
// 再現されず、実機デプロイまで気づけなかった)。OWASP 推奨値(600,000)は使えないため、
// Workers が許容する上限値を採用する。
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_HASH_ALGORITHM = 'SHA-256';
const PBKDF2_KEY_LENGTH_BITS = 256;
const PBKDF2_SALT_LENGTH_BYTES = 16;
const HASH_FORMAT = /^\$pbkdf2-sha256\$i=(\d+)\$([^$]+)\$([^$]+)$/;

async function deriveBits(
	password: string,
	salt: Uint8Array<ArrayBuffer>,
	iterations: number
): Promise<Uint8Array> {
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations, hash: PBKDF2_HASH_ALGORITHM },
		keyMaterial,
		PBKDF2_KEY_LENGTH_BITS
	);
	return new Uint8Array(bits);
}

// タイミング攻撃対策(比較時間を長さと内容に依存させない)。
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) {
		return false;
	}
	let diff = 0;
	for (let i = 0; i < a.length; i += 1) {
		diff |= a[i] ^ b[i];
	}
	return diff === 0;
}

export async function hashPassword(plain: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_LENGTH_BYTES));
	const derived = await deriveBits(plain, salt, PBKDF2_ITERATIONS);
	const saltB64 = Buffer.from(salt).toString('base64');
	const hashB64 = Buffer.from(derived).toString('base64');
	return `$pbkdf2-sha256$i=${PBKDF2_ITERATIONS}$${saltB64}$${hashB64}`;
}

export async function verifyPassword(hashValue: string, plain: string): Promise<boolean> {
	try {
		const match = HASH_FORMAT.exec(hashValue);
		if (!match) {
			return false;
		}
		const [, iterationsRaw, saltB64, hashB64] = match;
		const salt = new Uint8Array(Buffer.from(saltB64, 'base64'));
		const expected = new Uint8Array(Buffer.from(hashB64, 'base64'));
		const derived = await deriveBits(plain, salt, Number(iterationsRaw));
		return timingSafeEqual(derived, expected);
	} catch {
		// 不正なハッシュ形式等は検証失敗として扱う(例外を握りつぶさず false に正規化)。
		return false;
	}
}

@Injectable()
export class Pbkdf2PasswordHasher implements PasswordHasher {
	async hash(plain: string): Promise<string> {
		return hashPassword(plain);
	}

	async verify(hashValue: string, plain: string): Promise<boolean> {
		return verifyPassword(hashValue, plain);
	}
}
