// ルートレイアウト。テーマの FOUC 防止スクリプトを beforeInteractive で注入し、ThemeProvider で包む。
import type { Metadata } from 'next';
import Script from 'next/script';
import { getThemeInitScript, ThemeProvider } from '@lib';
import './globals.css';

export const metadata: Metadata = {
	title: {
		template: '%s | GenAI Profile Community',
		default: 'GenAI Profile Community'
	},
	description: 'Claudeをフル活用して作られたプロフィール共有コミュニティです。',
	metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:48032'),
	// サンプルアプリケーションのため、検索エンジンにインデックスされないようにする。
	// 各ページの metadata は robots を個別指定しない限りこの値を継承する。
	robots: {
		index: false,
		follow: false
	}
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
