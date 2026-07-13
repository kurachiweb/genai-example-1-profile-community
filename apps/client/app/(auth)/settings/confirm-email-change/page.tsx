// メールアドレス変更確認ページ。URL の token パラメータで変更確認 API を呼ぶ(BR-ACCT-007)。
// (my)/settings 配下ではなくここに置くのは、未ログイン状態(別端末でメールを開いた場合等)でも
// 確認を完了できるようにするため((my)/layout.tsx はセッション Cookie を必須とする)。
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';
import { verifyEmailChange } from '@/lib/api/client';
import { ApiError } from '@/lib/api/graphql';

export const metadata: Metadata = {
	title: 'メールアドレス変更の確認'
};

interface Props {
	readonly searchParams: Promise<{ token?: string }>;
}

export default async function ConfirmEmailChangePage({ searchParams }: Props) {
	const { token } = await searchParams;

	if (!token) {
		return <ErrorCard message="確認トークンが見つかりません。" />;
	}

	let confirmed = false;
	let errorMessage = '';

	try {
		await verifyEmailChange(token);
		confirmed = true;
	} catch (error) {
		errorMessage =
			error instanceof ApiError
				? error.message
				: 'メールアドレスの変更確認に失敗しました。リンクが無効か期限切れの可能性があります。';
	}

	if (confirmed) {
		return (
			<div className="w-full max-w-md rounded-xl border border-border bg-surface-raised p-8 text-center shadow-e2">
				<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent/10">
					<CheckCircle className="size-6 text-accent" aria-hidden="true" />
				</div>
				<h1 className="text-(length:--text-title) font-semibold text-text">
					メールアドレスを変更しました
				</h1>
				<p className="mt-3 text-(length:--text-body) text-text-muted">
					新しいメールアドレスでログインしてください。
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
				href="/settings"
				className="mt-6 inline-block text-(length:--text-meta) text-accent hover:underline"
			>
				アカウント設定に戻る
			</Link>
		</div>
	);
}
