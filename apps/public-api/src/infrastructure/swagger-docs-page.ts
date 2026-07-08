// Swagger UI(HTML)の自前ページ生成(Frameworks & Drivers)。
// @nestjs/swagger 標準の UI サーブ(SwaggerModule.setup の swaggerUiEnabled: true)は
// swagger-ui-dist をディスクから直接読む実装(__dirname + fs)のため、ファイルシステムを
// 持たない Cloudflare Workers では動作しない。ローカル/dev(main.ts)・Workers(worker.ts)で
// 挙動を統一するため、標準UIは無効化し(bootstrap.ts)、代わりに CDN(jsdelivr)から
// swagger-ui-dist を読み込む最小 HTML をここで生成する(BR-API-012)。
const SWAGGER_UI_DIST_CDN_BASE = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5';

export function buildSwaggerDocsHtml(jsonDocumentUrl: string): string {
	return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>GenAI Profile Community 公開 API ドキュメント</title>
<link rel="stylesheet" href="${SWAGGER_UI_DIST_CDN_BASE}/swagger-ui.css" />
</head>
<body>
<div id="swagger-ui"></div>
<script src="${SWAGGER_UI_DIST_CDN_BASE}/swagger-ui-bundle.js"></script>
<script>
window.addEventListener('load', () => {
	window.ui = SwaggerUIBundle({
		url: ${JSON.stringify(jsonDocumentUrl)},
		dom_id: '#swagger-ui'
	});
});
</script>
</body>
</html>
`;
}
