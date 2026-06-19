// パスキー認証の完了(BFF・未認証で可)。検証成功時にセッション Cookie を確立する。
import { NextResponse } from 'next/server';
import { finishPasskeyAuthentication } from '@/lib/api/admin';
import { setSession } from '@/lib/auth/session';

export async function POST(request: Request) {
	const body = (await request.json()) as { email?: string; response?: unknown };
	if (!body.email) {
		return NextResponse.json({ error: 'メールアドレスが指定されていません。' }, { status: 400 });
	}
	try {
		const result = await finishPasskeyAuthentication(
			body.email,
			JSON.stringify(body.response ?? {})
		);
		await setSession(result.sessionId);
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: 'パスキー認証に失敗しました。' }, { status: 401 });
	}
}
