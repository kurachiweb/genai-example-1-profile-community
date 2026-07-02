// 登録完了ページ。確認メール送信済み案内(アカウント存在有無を問わず一律表示)。
import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
	title: '確認メールを送信しました'
};

export default function RegisterSentPage() {
	return (
		<div className="w-full max-w-md rounded-xl border border-border bg-surface-raised p-8 text-center shadow-e2">
			<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent/10">
				<Mail className="size-6 text-accent" aria-hidden="true" />
			</div>
			<h1 className="text-(length:--text-title) font-semibold text-text">
				確認メールを送信しました
			</h1>
			<p className="mt-3 text-(length:--text-body) text-text-muted">
				ご入力のメールアドレスに確認リンクをお送りしました。
				メール内のリンクをクリックして登録を完了してください。
			</p>
			<p className="mt-2 text-(length:--text-caption) text-text-subtle">
				メールが届かない場合は迷惑メールフォルダをご確認ください。
			</p>
			<Link
				href="/login"
				className="mt-6 inline-block text-(length:--text-meta) text-accent hover:underline"
			>
				ログインページへ
			</Link>
		</div>
	);
}
