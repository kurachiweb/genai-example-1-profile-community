// アカウント設定ページ。パスワード変更・メールアドレス変更・退会を管理する。
import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/require-user';
import { PageHeader } from '@/components/ui/page-header';
import { PasswordChangeForm } from './password-change-form';
import { EmailChangeForm } from './email-change-form';
import { WithdrawSection } from './withdraw-section';
import { ResendVerificationButton } from './resend-verification-button';

export const metadata: Metadata = {
	title: 'アカウント設定'
};

export default async function SettingsPage() {
	const me = await requireUser();

	return (
		<div className="space-y-8">
			<PageHeader title="アカウント設定" description="メールアドレスやパスワードを管理します。" />

			{/* メール確認状態 */}
			<section aria-labelledby="email-status-heading">
				<h2
					id="email-status-heading"
					className="mb-3 text-(length:--text-title) font-semibold text-text"
				>
					メールアドレス
				</h2>
				<div className="rounded-xl border border-border bg-surface-raised p-5">
					<p className="text-(length:--text-meta) text-text">
						現在のメールアドレス: <strong>{me.email}</strong>
					</p>
					{me.emailVerifiedAt ? (
						<p className="mt-1 text-(length:--text-caption) text-success">確認済み</p>
					) : (
						<div className="mt-2 space-y-2">
							<p className="text-(length:--text-caption) text-warning">未確認</p>
							<ResendVerificationButton />
						</div>
					)}
				</div>
			</section>

			{/* メールアドレス変更 */}
			<section aria-labelledby="change-email-heading">
				<h2
					id="change-email-heading"
					className="mb-3 text-(length:--text-title) font-semibold text-text"
				>
					メールアドレスの変更
				</h2>
				<EmailChangeForm />
			</section>

			{/* パスワード変更 */}
			<section aria-labelledby="change-password-heading">
				<h2
					id="change-password-heading"
					className="mb-3 text-(length:--text-title) font-semibold text-text"
				>
					パスワードの変更
				</h2>
				<PasswordChangeForm />
			</section>

			{/* 退会 */}
			<section aria-labelledby="withdraw-heading">
				<h2
					id="withdraw-heading"
					className="mb-3 text-(length:--text-title) font-semibold text-text"
				>
					退会
				</h2>
				<WithdrawSection />
			</section>
		</div>
	);
}
