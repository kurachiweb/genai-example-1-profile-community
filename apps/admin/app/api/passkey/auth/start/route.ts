// パスキー認証の開始(BFF・未認証で可)。メールから認証オプションを発行する(列挙防止は api 側)。
import { NextResponse } from 'next/server';
import { startPasskeyAuthentication } from '@/lib/api/admin';

export async function POST(request: Request) {
	const body = (await request.json()) as { email?: string };
	if (!body.email) {
		return NextResponse.json({ error: 'メールアドレスを入力してください。' }, { status: 400 });
	}
	try {
		const options = await startPasskeyAuthentication(body.email);
		return NextResponse.json(options);
	} catch {
		return NextResponse.json({ error: 'パスキー認証を開始できませんでした。' }, { status: 400 });
	}
}
