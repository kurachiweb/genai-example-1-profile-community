// 認証済み管理者を要求するサーバーヘルパー。未認証(api が UNAUTHORIZED)なら /login へ。
import { redirect } from 'next/navigation';
import { getMe } from '../api/admin';
import { ApiError } from '../api/graphql';
import type { AdminMe } from '../api/types';

export async function requireAdmin(): Promise<AdminMe> {
	try {
		return await getMe();
	} catch (error) {
		if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
			// /login へ直行すると、失効した Cookie が残ったまま proxy が / へ戻し ERR_TOO_MANY_REDIRECTS になる
			// (api 再起動でインメモリセッションが消えた場合など)。Cookie を破棄するルートを挟んでループを断つ。
			redirect('/logout');
		}
		throw error;
	}
}
