// 認証系の Server Action(登録・ログイン・ログアウト)。
// Next の Server Action は同一オリジン検証で CSRF を防ぐ。
'use server';

import { redirect } from 'next/navigation';
import * as api from '../api/client';
import { ApiError } from '../api/errors';
import type { ActionResult } from '../actions';
import { clearSession, getSessionId, setSession } from './session';

export interface AuthState {
	readonly error?: string;
}

const GENERIC_LOGIN_FAILURE = 'メールアドレスかパスワードが正しくありません。';

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
	const email = String(formData.get('email') ?? '').trim();
	const password = String(formData.get('password') ?? '');
	if (!email || !password) {
		return { error: 'メールアドレスとパスワードを入力してください。' };
	}

	try {
		await api.register({ email, password });
	} catch (error) {
		if (error instanceof ApiError) {
			return { error: error.message };
		}
		return { error: '登録に失敗しました。時間をおいて再度お試しください。' };
	}
	// 登録成功 → 確認メール送信完了ページへ(アカウント存在列挙防止のため一律表示)。
	redirect('/register/sent');
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
	const email = String(formData.get('email') ?? '').trim();
	const password = String(formData.get('password') ?? '');
	const next = String(formData.get('next') ?? '').trim();
	if (!email || !password) {
		return { error: 'メールアドレスとパスワードを入力してください。' };
	}

	try {
		const result = await api.login(email, password);
		await setSession(result.sessionId);
	} catch {
		// 列挙防止のため統一文面(BR-COMMON-012)。詳細はサーバーログ側。
		return { error: GENERIC_LOGIN_FAILURE };
	}
	// redirect は例外で制御フローを抜けるため try/catch の外で呼ぶ。
	redirect(next || '/profile');
}

export async function requestPasswordResetAction(email: string): Promise<ActionResult> {
	try {
		await api.requestPasswordReset(email);
	} catch {
		// アカウント存在列挙防止のため、失敗時も成功と同一の応答にする(BR-COMMON-012 相当)。
	}
	return { ok: true };
}

export async function resetPasswordAction(
	token: string,
	newPassword: string
): Promise<ActionResult> {
	try {
		await api.resetPassword(token, newPassword);
		return { ok: true };
	} catch (error) {
		if (error instanceof ApiError) {
			return { ok: false, error: error.message };
		}
		return {
			ok: false,
			error: 'パスワードのリセットに失敗しました。リンクが無効か期限切れの可能性があります。'
		};
	}
}

export async function logoutAction(): Promise<void> {
	const sessionId = await getSessionId();
	if (sessionId) {
		try {
			await api.logout({ sessionId });
		} catch {
			// ログアウトはベストエフォート。失敗してもローカル Cookie は破棄する。
		}
	}
	await clearSession();
	redirect('/login');
}
