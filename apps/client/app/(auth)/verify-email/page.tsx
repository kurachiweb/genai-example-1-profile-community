// メール確認ページ。URL の token パラメータで確認 API を呼ぶ。
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';
import { verifyEmail } from '@/lib/api/client';
import { ApiError } from '@/lib/api/graphql';

export const metadata: Metadata = {
	title: 'メール確認'
};

interface Props {
	readonly searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
	const { token } = await searchParams;

	if (!token) {
		return <ErrorCard message="確認トークンが見つかりません。" />;
	}

	let verified = false;
	let errorMessage = '';

	try {
		await verifyEmail(token);
		verified = true;
	} catch (error) {
		errorMessage =
			error instanceof ApiError
				? error.message
				: 'メール確認に失敗しました。リンクが無効か期限切れの可能性があります。';
	}

	if (verified) {
		return (
			<div className="w-full max-w-md rounded-xl border border-border bg-surface-raised p-8 text-center shadow-e2">
				<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent/10">
					<CheckCircle className="size-6 text-accent" aria-hidden="true" />
				</div>
				<h1 className="text-(length:--text-title) font-semibold text-text">
					メールアドレスを確認しました
				</h1>
				<p className="mt-3 text-(length:--text-body) text-text-muted">
					アカウントが有効化されました。ログインしてプロフィールを設定しましょう。
				</p>
				<Link
					href="/login"
					className="mt-6 inline-block rounded-md bg-accent px-4 py-2 text-(length:--text-meta) font-medium text-white hover:opacity-90"
				>
					ログインする
				</Link>
			</div>
		);
	}

	return <ErrorCard message={errorMessage} />;
}

function ErrorCard({ message }: { message: string }) {
	return (
		<div className="w-full max-w-md rounded-xl border border-border bg-surface-raised p-8 text-center shadow-e2">
			<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-danger/10">
				<XCircle className="size-6 text-danger" aria-hidden="true" />
			</div>
			<h1 className="text-(length:--text-title) font-semibold text-text">確認に失敗しました</h1>
			<p className="mt-3 text-(length:--text-body) text-text-muted">{message}</p>
			<Link
				href="/register"
				className="mt-6 inline-block text-(length:--text-meta) text-accent hover:underline"
			>
				再度登録する
			</Link>
		</div>
	);
}
