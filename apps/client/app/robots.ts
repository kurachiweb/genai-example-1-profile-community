// サンプルアプリケーションのため、robots.txt レベルでも全ページのクロールを禁止する。
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			disallow: '/'
		}
	};
}
