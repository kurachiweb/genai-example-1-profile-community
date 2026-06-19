// パスキー登録の完了(BFF)。認証器レスポンスを api に渡して検証・保存する。
import { NextResponse } from 'next/server';
import { finishPasskeyRegistration } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/graphql';

export async function POST(request: Request) {
	const body = (await request.json()) as { response?: unknown; nickname?: string };
	try {
		await finishPasskeyRegistration(JSON.stringify(body.response ?? {}), body.nickname);
		return NextResponse.json({ ok: true });
	} catch (error) {
		const message = error instanceof ApiError ? error.message : 'パスキーの登録に失敗しました。';
		return NextResponse.json({ error: message }, { status: 400 });
	}
}
