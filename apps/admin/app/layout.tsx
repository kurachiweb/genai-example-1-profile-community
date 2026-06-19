// ルートレイアウト。テーマの FOUC 防止スクリプトを beforeInteractive で注入し、ThemeProvider で包む。
// 管理画面は検索エンジンに露出しない(robots noindex)。
import type { Metadata } from 'next';
import Script from 'next/script';
import { getThemeInitScript, ThemeProvider } from '@app/frontend-lib';
import './globals.css';

export const metadata: Metadata = {
	title: 'GenAI Profile Community 管理者コンソール',
	description: '運営チーム向けの管理者コンソール。',
	robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ja" suppressHydrationWarning>
			<body className="min-h-dvh bg-surface text-text antialiased">
				<Script
					id="theme-init"
					strategy="beforeInteractive"
					// 自前の決定論的スクリプト(外部入力なし)。初回描画前に .dark を解決し FOUC を防ぐ。
					dangerouslySetInnerHTML={{ __html: getThemeInitScript() }}
				/>
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
