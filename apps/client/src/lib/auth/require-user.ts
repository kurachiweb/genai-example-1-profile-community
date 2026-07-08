// 認証済み利用者を要求するサーバーヘルパー。未認証(api が UNAUTHORIZED)なら /login へ。
import { redirect } from 'next/navigation';
import { getMe } from '../api/client';
import { ApiError } from '../api/graphql';
import type { Me } from '../api/types';

export async function requireUser(): Promise<Me> {
	try {
		return await getMe();
	} catch (error) {
		if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
			// /login へ直行すると、失効した Cookie が残ったまま login/page.tsx の
			// redirectIfAuthenticated()(route-guards.ts)が / へ戻し、ログイン画面に到達できず
			// 再ログイン不能になる(api 再起動でインプロセスセッションが揮発した場合など)。
			// Cookie を破棄するルートを挟んでロックアウトを防ぐ。
			redirect('/logout');
		}
		throw error;
	}
}
