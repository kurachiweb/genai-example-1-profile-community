// 新規登録ページ。
import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
	title: '新規登録'
};

export default function RegisterPage() {
	return (
		<div className="grid w-full max-w-3xl gap-3 md:grid-cols-2">
			{/* ブランドタイル */}
			<section className="flex flex-col justify-between gap-8 rounded-xl border border-border bg-accent/8 p-8">
				<div className="flex items-center gap-2">
					<span aria-hidden="true" className="size-3 rounded-full bg-accent" />
					<span className="text-[length:var(--text-meta)] font-semibold text-text">
						GenAI Profile Community
					</span>
				</div>
				<div>
					<h1 className="text-[length:var(--text-display)] leading-tight font-bold text-text">
						新規登録
					</h1>
					<p className="mt-3 text-[length:var(--text-body)] text-text-muted">
						アカウントを作成して、あなたのプロフィールを公開しよう。
					</p>
				</div>
				<p className="text-[length:var(--text-caption)] text-text-subtle">
					すでにアカウントをお持ちの方は{' '}
					<Link href="/login" className="text-accent hover:underline">
						ログイン
					</Link>
				</p>
			</section>

			{/* フォームタイル */}
			<section className="rounded-xl border border-border bg-surface-raised p-8 shadow-e2">
				<RegisterForm />
			</section>
		</div>
	);
}
