// 認証系の Server Action(ログイン/ログアウト)。Next の Server Action は同一オリジン検証で CSRF を防ぐ。
'use server';

import { redirect } from 'next/navigation';
import { graphqlRequest } from '../api/graphql';
import { clearSession, getSessionId, setSession } from './session';

export interface LoginState {
	readonly error?: string;
}

interface AdminLoginResult {
	adminLogin: { sessionId: string; csrfToken: string; role: string };
}

const GENERIC_FAILURE = 'メールアドレスかパスワードが正しくありません。';

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
	const email = String(formData.get('email') ?? '').trim();
	const password = String(formData.get('password') ?? '');
	if (!email || !password) {
		return { error: 'メールアドレスとパスワードを入力してください。' };
	}

	try {
		const data = await graphqlRequest<AdminLoginResult>(
			`mutation($input:AdminLoginInput!){ adminLogin(input:$input){ sessionId csrfToken role } }`,
			{ input: { email, password } },
			{ sessionId: null }
		);
		await setSession(data.adminLogin.sessionId);
	} catch {
		// 列挙防止のため統一文面(BR-COMMON-012)。詳細はサーバーログ側。
		return { error: GENERIC_FAILURE };
	}
	// redirect は例外で制御フローを抜けるため try/catch の外で呼ぶ。
	redirect('/');
}

/** パスキー認証成功後にセッションを確立する(クライアントからの WebAuthn 完了後に呼ぶ)。 */
export async function establishPasskeySession(sessionId: string): Promise<void> {
	await setSession(sessionId);
}

export async function logoutAction(): Promise<void> {
	const sessionId = await getSessionId();
	if (sessionId) {
		try {
			await graphqlRequest(`mutation{ adminLogout }`, {}, { sessionId });
		} catch {
			// ログアウトはベストエフォート。失敗してもローカル Cookie は破棄する。
		}
	}
	await clearSession();
	redirect('/login');
}
