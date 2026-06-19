// パスキー登録の開始(BFF)。ログイン中の管理者セッションで api に登録オプションを発行させる。
import { NextResponse } from 'next/server';
import { startPasskeyRegistration } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/graphql';

export async function POST() {
	try {
		const options = await startPasskeyRegistration();
		return NextResponse.json(options);
	} catch (error) {
		const status = error instanceof ApiError && error.code === 'UNAUTHORIZED' ? 401 : 400;
		return NextResponse.json({ error: 'パスキー登録を開始できませんでした。' }, { status });
	}
}
