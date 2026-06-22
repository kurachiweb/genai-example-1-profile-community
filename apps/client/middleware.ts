// 認証ガード(UX 補助)。
// 認証必須ルート(/profile, /settings, /api-keys)でセッション Cookie が無ければ /login へ。
// ある状態で /login・/register を開けば / へ。
// 実際の認可は api 側で強制する(UI 非表示・遷移だけに依存しない)。
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE =
	process.env.NODE_ENV === 'production' ? '__Host-user_session' : 'user_session';

// 認証が必要なルートのプレフィックス。
const PROTECTED_PREFIXES = ['/profile', '/settings', '/api-keys'];

// ログイン済みの場合にリダイレクトするルート。
const AUTH_ONLY_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest): NextResponse {
	const hasSession = request.cookies.has(SESSION_COOKIE);
	const { pathname } = request.nextUrl;

	const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
	const isAuthOnly = AUTH_ONLY_PATHS.some((path) => pathname === path);

	if (!hasSession && isProtected) {
		const url = request.nextUrl.clone();
		url.pathname = '/login';
		url.searchParams.set('next', pathname);
		return NextResponse.redirect(url);
	}
	if (hasSession && isAuthOnly) {
		const url = request.nextUrl.clone();
		url.pathname = '/';
		return NextResponse.redirect(url);
	}
	return NextResponse.next();
}

// 静的アセット・Next 内部は対象外。
export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
