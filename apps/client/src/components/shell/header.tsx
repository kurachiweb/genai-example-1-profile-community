// サイトヘッダー。ロゴ・ナビゲーション・テーマ切替・ログイン/マイページリンクを含む。
import Link from 'next/link';
import { User } from 'lucide-react';
import { Button } from '@lib';
import { ThemeToggle } from './theme-toggle';
import { getSessionId } from '@/lib/auth/session';

export async function Header() {
	const sessionId = await getSessionId();
	const isLoggedIn = !!sessionId;

	return (
		<header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-sm">
			<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
				<Link
					href="/"
					className="flex items-center gap-1.5 text-(length:--text-meta) leading-tight font-semibold text-text hover:opacity-80"
				>
					<img
						src="/icon.png"
						width="32"
						height="32"
						alt="Service logo"
						decoding="async"
						className="rounded"
					/>
					<span>
						GenAI <br />
						Profile Community
					</span>
				</Link>

				<nav aria-label="サイトナビゲーション" className="flex items-center gap-1">
					<Link
						href="/profiles"
						className="rounded-md px-3 py-1.5 text-(length:--text-meta) text-text-muted hover:bg-surface-raised hover:text-text"
					>
						プロフィール一覧
					</Link>
					<ThemeToggle />
					{isLoggedIn ? (
						<Link href="/profile">
							<Button variant="outline" size="sm">
								<User className="size-3.5" aria-hidden="true" />
								マイページ
							</Button>
						</Link>
					) : (
						<Link href="/login">
							<Button size="sm">ログイン</Button>
						</Link>
					)}
				</nav>
			</div>
		</header>
	);
}
