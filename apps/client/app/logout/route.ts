// 失効セッションの回収ルート。api がセッションを拒否した際、ブラウザに残った Cookie を破棄して /login へ送る。
// login/register ページの redirectIfAuthenticated()(route-guards.ts)は Cookie の「有無」だけで
// 認証済みかを判定するため、無効な Cookie が残ると /login・/register が / へ戻され、
// 再ログイン不能(ロックアウト)になる。Cookie の変更は Route Handler でのみ許可される(RSC レンダリング中は不可)ため、
// 本ルートで破棄してロックアウトを防ぐ。
import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth/session';

export async function GET(request: Request): Promise<NextResponse> {
	await clearSession();
	return NextResponse.redirect(new URL('/login', request.url));
}
