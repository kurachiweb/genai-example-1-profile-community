// UX 補助のルーティングガード(旧 proxy.ts)。
// @opennextjs/cloudflare が Next.js 16 の Node.js 専用 proxy/middleware に非対応のため廃止した
// (https://nextjs.org/docs/messages/middleware-to-proxy)。未認証時の保護ルート → /login への
// リダイレクトは既存の requireAdmin()((console)/layout.tsx)が実 API 検証込みで担うため移設不要。
// ログイン済みで /login を開いた場合の / への戻しのみ、ここで受け持つ。
import { redirect } from 'next/navigation';
import { getSessionId } from './session';

/** ログインページ用。セッション Cookie があれば / へ(ログイン済みの二重アクセス防止)。 */
export async function redirectIfAuthenticated(): Promise<void> {
	const sessionId = await getSessionId();
	if (sessionId) {
		redirect('/');
	}
}
