// PasswordHasher(Gateway)の実装。Argon2id でハッシュ化・検証する(BR-COMMON-003)。
// hash-wasm(WASM実装)を local/dev/Workers 全環境で共通利用する(@node-rs/argon2 はネイティブ
// バインディングのため Cloudflare Workers で動作しないため不採用)。
// パラメータは Cloudflare Workers の CPU 時間制限(無料プランは 10ms/リクエスト)に収まるよう
// OWASP 推奨値(m=19MiB,t=2)より抑えている。実機での計測により見直すこと。
import { argon2id, argon2Verify } from 'hash-wasm';
import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '../application/admin/gateways';

const ARGON2_MEMORY_SIZE_KIB = 8192; // 8 MiB
const ARGON2_ITERATIONS = 2;
const ARGON2_PARALLELISM = 1;
const ARGON2_HASH_LENGTH = 32;
const ARGON2_SALT_LENGTH = 16;

export async function hashPassword(plain: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(ARGON2_SALT_LENGTH));
	return argon2id({
		password: plain,
		salt,
		memorySize: ARGON2_MEMORY_SIZE_KIB,
		iterations: ARGON2_ITERATIONS,
		parallelism: ARGON2_PARALLELISM,
		hashLength: ARGON2_HASH_LENGTH,
		outputType: 'encoded'
	});
}

export async function verifyPassword(hashValue: string, plain: string): Promise<boolean> {
	try {
		return await argon2Verify({ password: plain, hash: hashValue });
	} catch {
		// 不正なハッシュ形式等は検証失敗として扱う(例外を握りつぶさず false に正規化)。
		return false;
	}
}

@Injectable()
export class Argon2idPasswordHasher implements PasswordHasher {
	async hash(plain: string): Promise<string> {
		return hashPassword(plain);
	}

	async verify(hashValue: string, plain: string): Promise<boolean> {
		return verifyPassword(hashValue, plain);
	}
}
