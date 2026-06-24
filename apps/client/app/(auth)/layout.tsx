// 認証ページのレイアウト(ログイン・登録・パスワードリセット)。
// サイドバーなしのシンプルな中央配置レイアウト。
export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return <main className="grid min-h-dvh place-items-center bg-surface p-4">{children}</main>;
}
