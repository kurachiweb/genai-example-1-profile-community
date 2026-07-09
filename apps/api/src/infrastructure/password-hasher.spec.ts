import { hashPassword, verifyPassword, Pbkdf2PasswordHasher } from './password-hasher';

describe('hashPassword/verifyPassword', () => {
	test('正しいパスワードで検証に成功する', async () => {
		const hash = await hashPassword('correct-horse-battery-staple');

		expect(await verifyPassword(hash, 'correct-horse-battery-staple')).toBe(true);
	});

	test('誤ったパスワードは検証に失敗する', async () => {
		const hash = await hashPassword('correct-horse-battery-staple');

		expect(await verifyPassword(hash, 'wrong-password')).toBe(false);
	});

	test('同じパスワードでもソルトが異なるため毎回異なるハッシュ文字列になる', async () => {
		const hashA = await hashPassword('same-password');
		const hashB = await hashPassword('same-password');

		expect(hashA).not.toBe(hashB);
	});

	test('不正な形式のハッシュ文字列は例外を投げず検証失敗として扱う', async () => {
		await expect(verifyPassword('not-a-valid-hash', 'anything')).resolves.toBe(false);
	});

	test('WebAssembly実行時コンパイルに依存しない(Cloudflare Workersの制約回避、実機で確認済み)', async () => {
		// hash-wasm(Argon2id)は WebAssembly.compile() を実行時に呼ぶため
		// Cloudflare Workers の「実行時コード生成禁止」制約に抵触し、常に検証失敗していた
		// (実機で "Wasm code generation disallowed by embedder" を確認)。
		// Web Crypto API(PBKDF2)はネイティブ実装であり WebAssembly に依存しないことを確認する。
		const hash = await hashPassword('workers-safe');
		expect(hash.startsWith('$pbkdf2-sha256$')).toBe(true);
		expect(await verifyPassword(hash, 'workers-safe')).toBe(true);
	});
});

describe('Pbkdf2PasswordHasher', () => {
	test('PasswordHasher(Gateway)としてhash/verifyを提供する', async () => {
		const hasher = new Pbkdf2PasswordHasher();
		const hash = await hasher.hash('gateway-password');

		expect(await hasher.verify(hash, 'gateway-password')).toBe(true);
		expect(await hasher.verify(hash, 'wrong')).toBe(false);
	});
});
