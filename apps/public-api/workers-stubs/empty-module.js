// Cloudflare Workers 向けバンドル時の no-op スタブ。
// NestJSコア/@nestjs/swaggerが任意機能(WebSocket/microservices、class-transformerの
// バージョン差異吸収)を未使用でも読み込む(モジュール読み込み時に `class X extends Y {}` する、
// または `mod.SomeClass.register(...)` のようにプロパティ経由でメソッド呼び出しする)ため、
// どんな named import・プロパティアクセス・関数呼び出し・`new` にも応答する
// 再帰的な no-op スタブを返す(wrangler.jsonc の "alias" でこのファイルへ差し替える。
// 本アプリはこれらの機能を一切使わない)。
function createStub() {
	function NoopWorkersStub() {
		return undefined;
	}
	return new Proxy(NoopWorkersStub, {
		get(target, prop) {
			if (prop in target) {
				return target[prop];
			}
			return createStub();
		},
		construct() {
			return createStub();
		}
	});
}

module.exports = new Proxy(
	{},
	{
		get: () => createStub()
	}
);
