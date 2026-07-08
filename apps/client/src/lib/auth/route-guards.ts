// UX 補助のルーティングガード(旧 proxy.ts)。
// @opennextjs/cloudflare が Next.js 16 の Node.js 専用 proxy/middleware に非対応のため廃止し、
// 各 layout/page の Server Component へ移設した(https://nextjs.org/docs/messages/middleware-to-proxy)。
// 実際の認可は api 側で強制する(require-user.ts の requireUser、UI 非表示・遷移だけに依存しない)。
import { redirect } from 'next/navigation';
import { getSessionId } from './session';

/** 認証必須ルート用。セッション Cookie が無ければ /login へ。 */
export async function requireSessionCookie(): Promise<void> {
	const sessionId = await getSessionId();
	if (!sessionId) {
		redirect('/login');
	}
}

/** ログイン・登録ページ用。セッション Cookie があれば / へ(ログイン済みの二重アクセス防止)。 */
export async function redirectIfAuthenticated(): Promise<void> {
	const sessionId = await getSessionId();
	if (sessionId) {
		redirect('/');
	}
}
