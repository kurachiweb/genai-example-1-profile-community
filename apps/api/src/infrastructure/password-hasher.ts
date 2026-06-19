// PasswordHasher(Gateway)の実装。Argon2id でハッシュ化・検証する(BR-COMMON-003)。
// ローカル/Node では @node-rs/argon2(プリビルド)を用いる。Workers 本番は WASM/WebCrypto 実装へ差し替える。
import { hash, verify } from '@node-rs/argon2';
import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '../application/admin/gateways';

@Injectable()
export class Argon2idPasswordHasher implements PasswordHasher {
	async hash(plain: string): Promise<string> {
		// 既定アルゴリズムは Argon2id。パラメータはライブラリ既定(妥当なメモリ/反復)を用いる。
		return hash(plain);
	}

	async verify(hashValue: string, plain: string): Promise<boolean> {
		try {
			return await verify(hashValue, plain);
		} catch {
			// 不正なハッシュ形式等は検証失敗として扱う(例外を握りつぶさず false に正規化)。
			return false;
		}
	}
}
