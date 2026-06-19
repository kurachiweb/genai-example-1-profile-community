// 認証済みコンソールのシェル(左固定サイドバー＋上部バー)。未認証は requireAdmin が /login へ。
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import { requireAdmin } from '@/lib/auth/require-admin';

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
	const me = await requireAdmin();
	return (
		<div className="grid min-h-dvh grid-cols-1 md:grid-cols-[15rem_minmax(0,1fr)]">
			<aside className="hidden border-border bg-surface-raised md:block md:border-r">
				<div className="sticky top-0 h-dvh overflow-y-auto">
					<Sidebar role={me.role} />
				</div>
			</aside>
			<div className="flex min-w-0 flex-col">
				<Topbar role={me.role} />
				<main className="flex-1 p-6">{children}</main>
			</div>
		</div>
	);
}
