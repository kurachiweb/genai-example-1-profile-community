// 公開ページのレイアウト。ヘッダー・フッターを含む。認証は不要。
import { Header } from '@/components/shell/header';
import { Footer } from '@/components/shell/footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-dvh flex-col">
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	);
}
