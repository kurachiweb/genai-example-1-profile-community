import { hashPassword, verifyPassword, Pbkdf2PasswordHasher } from './password-hasher';

// テスト用ペッパー(本番相当の長さ・ランダム性を模した固定値。実運用は Wrangler Secrets で管理)。
const PEPPER_A = 'test-pepper-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const PEPPER_B = 'test-pepper-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

describe('hashPassword/verifyPassword', () => {
	test('正しいパスワードと正しいペッパーで検証に成功する', async () => {
		const hash = await hashPassword('correct-horse-battery-staple', PEPPER_A);

		expect(await verifyPassword(hash, 'correct-horse-battery-staple', PEPPER_A)).toBe(true);
	});

	test('誤ったパスワードは検証に失敗する', async () => {
		const hash = await hashPassword('correct-horse-battery-staple', PEPPER_A);

		expect(await verifyPassword(hash, 'wrong-password', PEPPER_A)).toBe(false);
	});

	test('同じパスワードでもソルトが異なるため毎回異なるハッシュ文字列になる', async () => {
		const hashA = await hashPassword('same-password', PEPPER_A);
		const hashB = await hashPassword('same-password', PEPPER_A);

		expect(hashA).not.toBe(hashB);
	});

	test('不正な形式のハッシュ文字列は例外を投げず検証失敗として扱う', async () => {
		await expect(verifyPassword('not-a-valid-hash', 'anything', PEPPER_A)).resolves.toBe(false);
	});

	test('WebAssembly実行時コンパイルに依存しない(Cloudflare Workersの制約回避、実機で確認済み)', async () => {
		// hash-wasm(Argon2id)は WebAssembly.compile() を実行時に呼ぶため
		// Cloudflare Workers の「実行時コード生成禁止」制約に抵触し、常に検証失敗していた
		// (実機で "Wasm code generation disallowed by embedder" を確認)。
		// Web Crypto API(PBKDF2)はネイティブ実装であり WebAssembly に依存しないことを確認する。
		const hash = await hashPassword('workers-safe', PEPPER_A);
		expect(hash.startsWith('$pbkdf2-sha256$')).toBe(true);
		expect(await verifyPassword(hash, 'workers-safe', PEPPER_A)).toBe(true);
	});

	// PBKDF2 のイテレーション数上限(100,000、Cloudflare Workers の crypto.subtle 制約)を
	// 補うための対策。DB(ソルト+ハッシュ)のみが漏洩しても、別途管理されるペッパーを
	// 知らない限りオフラインでの総当たり/辞書攻撃を一切開始できないことを検証する。
	test('同じパスワードでもペッパーが異なれば別のハッシュになる', async () => {
		const hashA = await hashPassword('pepper-dependent-password', PEPPER_A);
		const hashB = await hashPassword('pepper-dependent-password', PEPPER_B);

		expect(hashA).not.toBe(hashB);
	});

	test('ハッシュ化に使ったペッパーと異なるペッパーでは検証に失敗する(DB漏洩のみでは攻撃不能)', async () => {
		const hash = await hashPassword('pepper-dependent-password', PEPPER_A);

		expect(await verifyPassword(hash, 'pepper-dependent-password', PEPPER_B)).toBe(false);
	});

	test('ペッパーが空文字列の場合は例外を投げる(必須シークレットの起動時検証)', async () => {
		await expect(hashPassword('any-password', '')).rejects.toThrow();
	});

	test('ペッパーが短すぎる場合は例外を投げる', async () => {
		await expect(hashPassword('any-password', 'too-short')).rejects.toThrow();
	});
});

describe('Pbkdf2PasswordHasher', () => {
	test('PasswordHasher(Gateway)としてhash/verifyを提供する', async () => {
		const hasher = new Pbkdf2PasswordHasher(PEPPER_A);
		const hash = await hasher.hash('gateway-password');

		expect(await hasher.verify(hash, 'gateway-password')).toBe(true);
		expect(await hasher.verify(hash, 'wrong')).toBe(false);
	});

	test('異なるペッパーを持つインスタンス間ではハッシュを検証できない', async () => {
		const hasherA = new Pbkdf2PasswordHasher(PEPPER_A);
		const hasherB = new Pbkdf2PasswordHasher(PEPPER_B);
		const hash = await hasherA.hash('gateway-password');

		expect(await hasherB.verify(hash, 'gateway-password')).toBe(false);
	});
});
