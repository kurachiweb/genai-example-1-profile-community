// サイトフッター。著作権表示と利用規約リンク。
import Link from 'next/link';

export function Footer() {
	const year = new Date().getFullYear();
	return (
		<footer className="border-t border-border bg-surface">
			<div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-6 text-[length:var(--text-caption)] text-text-subtle sm:flex-row sm:justify-between">
				<p>© {year} GenAI Profile Community</p>
				<nav aria-label="フッターナビゲーション" className="flex gap-4">
					<Link href="/terms" className="hover:text-text-muted hover:underline">
						利用規約
					</Link>
					<Link href="/privacy" className="hover:text-text-muted hover:underline">
						プライバシーポリシー
					</Link>
					<Link href="/help" className="hover:text-text-muted hover:underline">
						ヘルプ
					</Link>
				</nav>
			</div>
		</footer>
	);
}
