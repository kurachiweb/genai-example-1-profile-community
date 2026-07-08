// ログインページ。Bento タイル風レイアウト（ブランドタイル＋フォームタイル）。
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirectIfAuthenticated } from '@/lib/auth/route-guards';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
	title: 'ログイン'
};

export default async function LoginPage() {
	await redirectIfAuthenticated();
	return (
		<div className="grid w-full max-w-3xl gap-3 md:grid-cols-2">
			{/* ブランドタイル */}
			<section className="flex flex-col justify-between gap-8 rounded-xl border border-border bg-accent/8 p-8">
				<div className="flex items-center gap-2">
					<span aria-hidden="true" className="size-3 rounded-full bg-accent" />
					<span className="text-(length:--text-meta) font-semibold text-text">
						GenAI Profile Community
					</span>
				</div>
				<div>
					<h1 className="text-(length:--text-display) leading-tight font-bold text-text">
						ログイン
					</h1>
					<p className="mt-3 text-(length:--text-body) text-text-muted">
						あなたのプロフィールで世界とつながろう。
					</p>
				</div>
				<p className="text-(length:--text-caption) text-text-subtle">
					アカウントをお持ちでない方は{' '}
					<Link href="/register" className="text-accent hover:underline">
						新規登録
					</Link>
				</p>
			</section>

			{/* フォームタイル */}
			<section className="rounded-xl border border-border bg-surface-raised p-8 shadow-e2">
				<LoginForm />
			</section>
		</div>
	);
}
