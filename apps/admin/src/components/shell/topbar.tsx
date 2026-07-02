// 上部バー。現在のロール表示・テーマ切替・ログアウト。design 02-layout §6/§7。
import { LogOut } from 'lucide-react';
import { Badge } from '@lib';
import { logoutAction } from '@/lib/auth/actions';
import type { AdminRole } from '@/lib/api/types';
import { roleLabel } from '@/lib/i18n/labels';
import { ThemeToggle } from './theme-toggle';

export function Topbar({ role }: { role: AdminRole }) {
	return (
		<header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-3 border-b border-border bg-surface/80 px-6 backdrop-blur">
			<Badge tone="accent">{roleLabel(role)}</Badge>
			<ThemeToggle />
			<form action={logoutAction}>
				<button
					type="submit"
					className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-(length:--text-meta) font-medium text-text-muted transition-colors hover:bg-surface-sunken hover:text-text"
				>
					<LogOut className="size-4" aria-hidden="true" />
					ログアウト
				</button>
			</form>
		</header>
	);
}
