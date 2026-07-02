// ログイン画面(Bento タイル風)。ブランドタイル＋フォームタイルで構成する(ユーザー選択のレイアウト)。
// 独立ページ(サイドバー無し)。温かみのある Bento・コーラル差し色(design/00・01)。
import { LoginForm } from './login-form';

export default function LoginPage() {
	return (
		<main className="grid min-h-dvh place-items-center p-4">
			<div className="grid w-full max-w-3xl gap-3 md:grid-cols-2">
				{/* ブランドタイル(主役を控えめに・コーラルは線/差し色に留める) */}
				<section className="flex flex-col justify-between gap-8 rounded-xl border border-border bg-accent/8 p-8">
					<div className="flex items-center gap-2">
						<span aria-hidden="true" className="size-3 rounded-full bg-accent" />
						<span className="text-(length:--text-meta) font-semibold text-text">
							GenAI Profile Community
						</span>
					</div>
					<div>
						<h1 className="text-(length:--text-display) leading-tight font-bold text-text">
							管理者
							<br />
							コンソール
						</h1>
						<p className="mt-3 text-(length:--text-body) text-text-muted">
							運営チーム向け。安全に、すばやく。
						</p>
					</div>
				</section>

				{/* フォームタイル(一段持ち上げて視線の起点に) */}
				<section className="rounded-xl border border-border bg-surface-raised p-8 shadow-e2">
					<LoginForm />
				</section>
			</div>
		</main>
	);
}
