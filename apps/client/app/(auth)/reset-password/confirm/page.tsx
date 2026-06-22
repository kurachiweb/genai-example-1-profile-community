// パスワードリセット完了ページ。URL の token パラメータで新パスワードを設定する。
import type { Metadata } from 'next';
import { ResetPasswordConfirmForm } from './reset-password-confirm-form';

export const metadata: Metadata = {
	title: '新しいパスワードを設定'
};

interface Props {
	readonly searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordConfirmPage({ searchParams }: Props) {
	const { token } = await searchParams;

	if (!token) {
		return (
			<div className="w-full max-w-md rounded-xl border border-border bg-surface-raised p-8 shadow-e2 text-center">
				<h1 className="text-[length:var(--text-title)] font-semibold text-text">
					無効なリンク
				</h1>
				<p className="mt-3 text-[length:var(--text-body)] text-text-muted">
					パスワードリセットリンクが無効です。再度お試しください。
				</p>
			</div>
		);
	}

	return (
		<div className="w-full max-w-md">
			<div className="rounded-xl border border-border bg-surface-raised p-8 shadow-e2">
				<h1 className="text-[length:var(--text-title)] font-semibold text-text">
					新しいパスワードを設定
				</h1>
				<div className="mt-6">
					<ResetPasswordConfirmForm token={token} />
				</div>
			</div>
		</div>
	);
}
