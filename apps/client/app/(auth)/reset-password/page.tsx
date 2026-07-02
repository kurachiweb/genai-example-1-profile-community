// パスワードリセットリクエストページ。
// 入力メールの存在有無に関わらず同一の完了表示を返す(BR-ACCT-006、列挙防止)。
import type { Metadata } from 'next';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = {
	title: 'パスワードリセット'
};

export default function ResetPasswordPage() {
	return (
		<div className="w-full max-w-md">
			<div className="rounded-xl border border-border bg-surface-raised p-8 shadow-e2">
				<h1 className="text-(length:--text-title) font-semibold text-text">パスワードをリセット</h1>
				<p className="mt-2 text-(length:--text-meta) text-text-muted">
					登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
				</p>
				<div className="mt-6">
					<ResetPasswordForm />
				</div>
			</div>
		</div>
	);
}
