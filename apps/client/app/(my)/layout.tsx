// 認証必須ページのレイアウト。ヘッダー・フッター・サイドナビを含む。
// 実際の認可確認は各ページの requireUser() で行う。
import Link from 'next/link';
import { KeyRound, Settings, User } from 'lucide-react';
import { Header } from '@/components/shell/header';
import { Footer } from '@/components/shell/footer';

const NAV_ITEMS = [
	{ href: '/profile', icon: User, label: 'プロフィール編集' },
	{ href: '/settings', icon: Settings, label: 'アカウント設定' },
	{ href: '/api-keys', icon: KeyRound, label: 'API キー' }
];

export default function MyLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-dvh flex-col">
			<Header />
			<div className="mx-auto flex w-full max-w-5xl flex-1 gap-6 px-4 py-8">
				{/* サイドナビ */}
				<aside className="hidden w-48 shrink-0 md:block">
					<nav aria-label="マイページナビゲーション">
						<ul className="space-y-1">
							{NAV_ITEMS.map(({ href, icon: Icon, label }) => (
								<li key={href}>
									<Link
										href={href}
										className="flex items-center gap-2 rounded-md px-3 py-2 text-(length:--text-meta) text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
									>
										<Icon className="size-4 shrink-0" aria-hidden="true" />
										{label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</aside>

				{/* コンテンツ */}
				<main className="min-w-0 flex-1">{children}</main>
			</div>
			<Footer />
		</div>
	);
}
