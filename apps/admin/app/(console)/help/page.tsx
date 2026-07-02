// ヘルプ記事管理(BR-CONTENT-005)。support 以上が作成・編集・公開切替。公開記事は client でログイン不要閲覧。
import { Badge, formatDateTime } from '@lib';
import { HelpFormDialog, HelpStatusToggle } from '@/components/content/help';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { listHelpArticles } from '@/lib/api/content';
import { helpStatusLabel } from '@/lib/i18n/labels';

export default async function HelpPage() {
	const articles = await listHelpArticles();

	return (
		<div>
			<PageHeader
				title="ヘルプ記事"
				description="ヘルプ記事の作成・編集・公開。"
				actions={<HelpFormDialog />}
			/>

			{articles.length === 0 ? (
				<p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-(length:--text-meta) text-text-muted">
					ヘルプ記事はまだありません。
				</p>
			) : (
				<Table>
					<THead>
						<TR>
							<TH>タイトル</TH>
							<TH>スラッグ</TH>
							<TH>カテゴリ</TH>
							<TH>状態</TH>
							<TH>更新日時</TH>
							<TH className="sr-only">操作</TH>
						</TR>
					</THead>
					<TBody>
						{articles.map((article) => (
							<TR key={article.id}>
								<TD className="font-medium">{article.title}</TD>
								<TD className="text-text-muted">/{article.slug}</TD>
								<TD className="text-text-muted">{article.category ?? '—'}</TD>
								<TD>
									<Badge tone={article.status === 'published' ? 'success' : 'neutral'}>
										{helpStatusLabel(article.status)}
									</Badge>
								</TD>
								<TD className="whitespace-nowrap text-text-muted">
									{formatDateTime(article.updatedAt)}
								</TD>
								<TD>
									<div className="flex items-center justify-end gap-2">
										<HelpFormDialog article={article} />
										<HelpStatusToggle id={article.id} status={article.status} />
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
