// 認証ガード(UX 補助)。セッション Cookie が無ければ /login へ、ある状態で /login を開けば / へ。
// 実際の認可は api 側で強制する(UI 非表示・遷移だけに依存しない、AC-ADMIN-001)。
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE =
	process.env.NODE_ENV === 'production' ? '__Host-admin_session' : 'admin_session';

export function proxy(request: NextRequest): NextResponse {
	const hasSession = request.cookies.has(SESSION_COOKIE);
	const { pathname } = request.nextUrl;
	const isLoginRoute = pathname === '/login';

	if (!hasSession && !isLoginRoute) {
		const url = request.nextUrl.clone();
		url.pathname = '/login';
		return NextResponse.redirect(url);
	}
	if (hasSession && isLoginRoute) {
		const url = request.nextUrl.clone();
		url.pathname = '/';
		return NextResponse.redirect(url);
	}
	return NextResponse.next();
}

// 静的アセット・Next 内部・API ルートは対象外。
export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|api/passkey).*)']
};
