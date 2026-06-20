// サイドバーのナビゲーション定義。表示は role で絞り、操作可否は最終的に api が強制する(AC-ADMIN-001)。
import {
	FileText,
	Fingerprint,
	Flag,
	HelpCircle,
	Inbox,
	KeyRound,
	LayoutDashboard,
	Mail,
	Megaphone,
	ScrollText,
	ShieldCheck,
	Unlock,
	Users,
	type LucideIcon
} from 'lucide-react';
import type { AdminRole } from '@/lib/api/types';

export interface NavItem {
	readonly href: string;
	readonly label: string;
	readonly icon: LucideIcon;
	/** super_admin のみ表示する項目。 */
	readonly superAdminOnly?: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
	{ href: '/', label: 'ダッシュボード', icon: LayoutDashboard },
	{ href: '/users', label: 'ユーザー管理', icon: Users },
	{ href: '/reports', label: '通報', icon: Flag },
	{ href: '/unfreeze-requests', label: '解除リクエスト', icon: Unlock },
	{ href: '/api-keys', label: 'API キー運用', icon: KeyRound },
	{ href: '/audit-logs', label: '監査ログ', icon: ScrollText },
	{ href: '/announcements', label: 'お知らせ', icon: Megaphone },
	{ href: '/email', label: 'メール通知', icon: Mail },
	{ href: '/help', label: 'ヘルプ記事', icon: HelpCircle },
	{ href: '/inquiries', label: '問い合わせ', icon: Inbox },
	{ href: '/policies', label: '規約・ポリシー', icon: FileText },
	{ href: '/admins', label: '管理者・権限', icon: ShieldCheck, superAdminOnly: true },
	{ href: '/settings/passkeys', label: 'セキュリティ', icon: Fingerprint }
];

export function visibleNavItems(role: AdminRole): readonly NavItem[] {
	return NAV_ITEMS.filter((item) => !item.superAdminOnly || role === 'super_admin');
}
