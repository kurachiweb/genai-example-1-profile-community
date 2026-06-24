// 左固定サイドバー。現在地を強調し、role に応じて項目を絞る(design 02-layout §6)。
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@lib';
import type { AdminRole } from '@/lib/api/types';
import { visibleNavItems } from './nav-config';

function isActive(pathname: string, href: string): boolean {
	if (href === '/') {
		return pathname === '/';
	}
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ role }: { role: AdminRole }) {
	const pathname = usePathname();
	const items = visibleNavItems(role);

	return (
		<nav aria-label="管理ナビゲーション" className="flex h-full flex-col gap-1 p-3">
			<div className="mb-4 flex items-center gap-2 px-2 py-1">
				<span aria-hidden="true" className="size-3 rounded-full bg-accent" />
				<span className="text-[length:var(--text-meta)] font-semibold text-text">GenAI Admin</span>
			</div>
			<ul className="flex flex-col gap-0.5">
				{items.map((item) => {
					const active = isActive(pathname, item.href);
					const Icon = item.icon;
					return (
						<li key={item.href}>
							<Link
								href={item.href}
								aria-current={active ? 'page' : undefined}
								className={cn(
									'flex items-center gap-3 rounded-md px-3 py-2 text-[length:var(--text-meta)] font-medium transition-colors',
									active
										? 'bg-accent/12 text-accent'
										: 'text-text-muted hover:bg-surface-sunken hover:text-text'
								)}
							>
								<Icon className="size-4 shrink-0" aria-hidden="true" />
								<span>{item.label}</span>
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
