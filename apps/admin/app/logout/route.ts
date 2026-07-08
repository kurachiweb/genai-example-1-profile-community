// 失効セッションの回収ルート。api がセッションを拒否した際、ブラウザに残った Cookie を破棄して /login へ送る。
// login/page.tsx の redirectIfAuthenticated()(route-guards.ts)は Cookie の「有無」だけで認証を
// 判定するため、無効な Cookie が残ると / と /login の間で無限リダイレクトになる。
// Cookie の変更は Route Handler でのみ許可される(RSC レンダリング中は不可)ため、本ルートで破棄してループを断ち切る。
import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth/session';

export async function GET(request: Request): Promise<NextResponse> {
	await clearSession();
	return NextResponse.redirect(new URL('/login', request.url));
}
