// WebAuthn のクライアント側オーケストレーション。@simplewebauthn/browser に認証器操作を委譲し、
// BFF のルートハンドラ経由で api と通信する(秘密鍵はブラウザ/認証器に閉じる、BR-COMMON-016)。
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

async function readError(response: Response, fallback: string): Promise<string> {
	try {
		const body = (await response.json()) as { error?: string };
		return body.error ?? fallback;
	} catch {
		return fallback;
	}
}

export async function registerPasskey(nickname?: string): Promise<void> {
	const optionsRes = await fetch('/api/passkey/register/start', { method: 'POST' });
	if (!optionsRes.ok) {
		throw new Error(await readError(optionsRes, 'パスキー登録を開始できませんでした。'));
	}
	const optionsJSON = (await optionsRes.json()) as Parameters<
		typeof startRegistration
	>[0]['optionsJSON'];
	const response = await startRegistration({ optionsJSON });
	const finishRes = await fetch('/api/passkey/register/finish', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ response, nickname })
	});
	if (!finishRes.ok) {
		throw new Error(await readError(finishRes, 'パスキーの登録に失敗しました。'));
	}
}

export async function loginWithPasskey(email: string): Promise<void> {
	const optionsRes = await fetch('/api/passkey/auth/start', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ email })
	});
	if (!optionsRes.ok) {
		throw new Error(await readError(optionsRes, 'パスキー認証を開始できませんでした。'));
	}
	const optionsJSON = (await optionsRes.json()) as Parameters<
		typeof startAuthentication
	>[0]['optionsJSON'];
	const response = await startAuthentication({ optionsJSON });
	const finishRes = await fetch('/api/passkey/auth/finish', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ email, response })
	});
	if (!finishRes.ok) {
		throw new Error(await readError(finishRes, 'パスキー認証に失敗しました。'));
	}
}
