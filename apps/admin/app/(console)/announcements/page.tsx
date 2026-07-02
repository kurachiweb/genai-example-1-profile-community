// お知らせ管理(BR-CONTENT-001/002)。作成/編集・公開/非公開・削除。下書きは support 以上、公開は moderator 以上(apiで強制)。
import { Badge, formatDateTime } from '@lib';
import { AnnouncementFormDialog, AnnouncementRowActions } from '@/components/content/announcements';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { listAnnouncements } from '@/lib/api/content';
import { announcementStatusLabel, importanceLabel } from '@/lib/i18n/labels';

export default async function AnnouncementsPage() {
	const announcements = await listAnnouncements();

	return (
		<div>
			<PageHeader
				title="お知らせ"
				description="サイト内お知らせの作成・公開。"
				actions={<AnnouncementFormDialog />}
			/>

			{announcements.length === 0 ? (
				<p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-(length:--text-meta) text-text-muted">
					お知らせはまだありません。
				</p>
			) : (
				<Table>
					<THead>
						<TR>
							<TH>タイトル</TH>
							<TH>状態</TH>
							<TH>重要度</TH>
							<TH>更新日時</TH>
							<TH className="sr-only">操作</TH>
						</TR>
					</THead>
					<TBody>
						{announcements.map((announcement) => (
							<TR key={announcement.id}>
								<TD className="font-medium">{announcement.title}</TD>
								<TD>
									<Badge tone={announcement.status === 'published' ? 'success' : 'neutral'}>
										{announcementStatusLabel(announcement.status)}
									</Badge>
								</TD>
								<TD>
									{announcement.importance === 'important' ? (
										<Badge tone="warning">{importanceLabel(announcement.importance)}</Badge>
									) : (
										<span className="text-text-muted">
											{importanceLabel(announcement.importance)}
										</span>
									)}
								</TD>
								<TD className="whitespace-nowrap text-text-muted">
									{formatDateTime(announcement.updatedAt)}
								</TD>
								<TD>
									<div className="flex items-center justify-end gap-2">
										<AnnouncementFormDialog announcement={announcement} />
										<AnnouncementRowActions id={announcement.id} status={announcement.status} />
									</div>
								</TD>
							</TR>
						))}
					</TBody>
				</Table>
			)}
		</div>
	);
}
