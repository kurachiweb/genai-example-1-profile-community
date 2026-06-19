// 管理者アカウント・権限(BR-ADMIN-001/002・US-0706)。閲覧は viewer 以上、管理操作は super_admin のみ。
import { Badge, Card, CardTitle, formatDate } from '@app/frontend-lib';
import {
	CreateAdminForm,
	DisableAdminButton,
	RoleChangeButton
} from '@/components/admins/management';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { getMe, listAdmins } from '@/lib/api/admin';
import type { AdminRole } from '@/lib/api/types';
import { roleLabel } from '@/lib/i18n/labels';

function roleTone(role: AdminRole): 'accent' | 'info' | 'neutral' {
	if (role === 'super_admin') return 'accent';
	if (role === 'moderator' || role === 'support') return 'info';
	return 'neutral';
}

export default async function AdminsPage() {
	const [me, admins] = await Promise.all([getMe(), listAdmins()]);
	const canManage = me.role === 'super_admin';

	return (
		<div>
			<PageHeader
				title="管理者・権限"
				description="管理者アカウントとロールの管理。最小権限の原則に従います。"
			/>

			{canManage ? (
				<Card elevation={1} className="mb-6">
					<CardTitle as="h2" className="text-[length:var(--text-occupation)]">
						管理者を追加
					</CardTitle>
					<p className="mt-1 mb-4 text-[length:var(--text-caption)] text-text-muted">
						追加は監査ログに記録されます。初期スーパー管理者はプロビジョニング手順で作成します。
					</p>
					<CreateAdminForm />
				</Card>
			) : null}

			<Table>
				<THead>
					<TR>
						<TH>メールアドレス</TH>
						<TH>ロール</TH>
						<TH>状態</TH>
						<TH className="text-right">パスキー</TH>
						<TH>作成日</TH>
						{canManage ? <TH className="sr-only">操作</TH> : null}
					</TR>
				</THead>
				<TBody>
					{admins.map((admin) => {
						const isSelf = admin.id === me.adminId;
						return (
							<TR key={admin.id}>
								<TD className="font-medium">
									{admin.email}
									{isSelf ? (
										<span className="ml-2 text-[length:var(--text-caption)] text-text-subtle">
											(自分)
										</span>
									) : null}
								</TD>
								<TD>
									<Badge tone={roleTone(admin.role)}>{roleLabel(admin.role)}</Badge>
								</TD>
								<TD>
									<Badge tone={admin.status === 'active' ? 'success' : 'neutral'}>
										{admin.status === 'active' ? '有効' : '無効'}
									</Badge>
								</TD>
								<TD className="text-right tabular-nums">{admin.passkeyCount}</TD>
								<TD className="whitespace-nowrap text-text-muted">{formatDate(admin.createdAt)}</TD>
								{canManage ? (
									<TD className="text-right">
										{admin.status === 'active' ? (
											<div className="flex justify-end gap-2">
												<RoleChangeButton adminId={admin.id} currentRole={admin.role} />
												{isSelf ? null : <DisableAdminButton adminId={admin.id} />}
											</div>
										) : (
											'—'
										)}
									</TD>
								) : null}
							</TR>
						);
					})}
				</TBody>
			</Table>
		</div>
	);
}
