// 利用者セッション Cookie の操作(BFF)。HttpOnly・SameSite・本番は __Host- + Secure(BR-COMMON-001)。
// セッション ID はブラウザ JS から読めない(HttpOnly)。CSRF は Server Actions の同一オリジン検証＋ SameSite で防ぐ。
import { cookies } from 'next/headers';
import { SESSION_COOKIE, USER_SESSION_TTL_SECONDS } from './constants';

const isProduction = process.env.NODE_ENV === 'production';

export { SESSION_COOKIE };

export async function getSessionId(): Promise<string | undefined> {
	return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function setSession(sessionId: string): Promise<void> {
	const store = await cookies();
	store.set(SESSION_COOKIE, sessionId, {
		httpOnly: true,
		sameSite: 'lax',
		secure: isProduction,
		path: '/',
		maxAge: USER_SESSION_TTL_SECONDS
	});
}

export async function clearSession(): Promise<void> {
	const store = await cookies();
	store.delete(SESSION_COOKIE);
}
