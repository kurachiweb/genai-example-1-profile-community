// メール通知(BR-CONTENT-003)。moderator 以上が作成・テスト送信・配信。配信は監査ログに記録される。
import { Badge, formatDateTime } from '@lib';
import { EmailComposeForm, EmailRowActions } from '@/components/content/email';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { listEmailNotifications, listEmailTemplates } from '@/lib/api/content';
import { emailStatusLabel, emailTargetLabel } from '@/lib/i18n/labels';

export default async function EmailPage() {
	const [notifications, templates] = await Promise.all([
		listEmailNotifications(),
		listEmailTemplates()
	]);

	return (
		<div>
			<PageHeader
				title="メール通知"
				description="お知らせ系メールの作成・配信。トランザクションメールは対象外です。"
				actions={<EmailComposeForm templates={templates} />}
			/>

			{notifications.length === 0 ? (
				<p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-(length:--text-meta) text-text-muted">
					メール通知はまだありません。
				</p>
			) : (
				<Table>
					<THead>
						<TR>
							<TH>件名</TH>
							<TH>テンプレート</TH>
							<TH>配信対象</TH>
							<TH>状態</TH>
							<TH>配信日時</TH>
							<TH className="sr-only">操作</TH>
						</TR>
					</THead>
					<TBody>
						{notifications.map((notification) => (
							<TR key={notification.id}>
								<TD className="font-medium">{notification.subject}</TD>
								<TD className="text-text-muted">{notification.templateKey}</TD>
								<TD className="text-text-muted">
									{emailTargetLabel(notification.targetCondition)}
								</TD>
								<TD>
									<Badge tone={notification.status === 'sent' ? 'success' : 'neutral'}>
										{emailStatusLabel(notification.status)}
									</Badge>
								</TD>
								<TD className="whitespace-nowrap text-text-muted">
									{notification.sentAt ? formatDateTime(notification.sentAt) : '—'}
								</TD>
								<TD>
									<EmailRowActions id={notification.id} status={notification.status} />
								</TD>
							</TR>
						))}
					</TBody>
				</Table>
			)}
		</div>
	);
}
