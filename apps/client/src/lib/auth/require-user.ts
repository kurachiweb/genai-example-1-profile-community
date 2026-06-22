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
			redirect('/login');
		}
		throw error;
	}
}
