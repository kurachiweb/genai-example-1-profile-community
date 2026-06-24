// 問い合わせ対応(BR-CONTENT-006/007)。support 以上が状態管理。report/unfreeze は各キューへ連携(features/06)。
import Link from 'next/link';
import { Badge, formatRelativeTime } from '@lib';
import { InquiryStatusButtons } from '@/components/content/inquiries';
import { PageHeader } from '@/components/ui/page-header';
import { StatusFilter } from '@/components/ui/status-filter';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { listInquiries } from '@/lib/api/content';
import { inquiryCategoryLabel, inquiryStatusLabel, inquiryStatusTone } from '@/lib/i18n/labels';

const STATUS_OPTIONS: ReadonlyArray<readonly [string, string]> = [
	['OPEN', '未対応'],
	['IN_PROGRESS', '対応中'],
	['CLOSED', '完了'],
	['', 'すべて']
];

function categoryTone(category: string): 'neutral' | 'danger' | 'info' {
	if (category === 'report') return 'danger';
	if (category === 'unfreeze') return 'info';
	return 'neutral';
}

export default async function InquiriesPage({
	searchParams
}: {
	searchParams: Promise<{ status?: string }>;
}) {
	const params = await searchParams;
	const status = params.status ?? 'OPEN';
	const inquiries = await listInquiries({ status: status || undefined });

	return (
		<div>
			<PageHeader title="問い合わせ" description="問い合わせの確認と対応状況の管理。" />
			<StatusFilter basePath="/inquiries" current={status} options={STATUS_OPTIONS} />

			{inquiries.length === 0 ? (
				<p className="mt-4 rounded-lg border border-dashed border-border px-4 py-12 text-center text-[length:var(--text-meta)] text-text-muted">
					該当する問い合わせはありません。
				</p>
			) : (
				<Table className="mt-4">
					<THead>
						<TR>
							<TH>区分</TH>
							<TH>件名・本文</TH>
							<TH>連絡先</TH>
							<TH>状態</TH>
							<TH>受信</TH>
							<TH className="sr-only">操作</TH>
						</TR>
					</THead>
					<TBody>
						{inquiries.map((inquiry) => (
							<TR key={inquiry.id}>
								<TD>
									<Badge tone={categoryTone(inquiry.category)}>
										{inquiryCategoryLabel(inquiry.category)}
									</Badge>
								</TD>
								<TD className="max-w-md">
									{inquiry.subject ? (
										<p className="font-medium text-text">{inquiry.subject}</p>
									) : null}
									<p className="line-clamp-2 text-[length:var(--text-caption)] text-text-muted">
										{inquiry.body}
									</p>
								</TD>
								<TD className="text-text-muted">{inquiry.contactEmail ?? '—'}</TD>
								<TD>
									<Badge tone={inquiryStatusTone(inquiry.status)}>
										{inquiryStatusLabel(inquiry.status)}
									</Badge>
								</TD>
								<TD className="whitespace-nowrap text-text-muted">
									{formatRelativeTime(inquiry.createdAt)}
								</TD>
								<TD>
									{inquiry.category === 'report' ? (
										<Link
											href="/reports"
											className="text-[length:var(--text-meta)] text-accent hover:underline"
										>
											通報キューへ ›
										</Link>
									) : inquiry.category === 'unfreeze' ? (
										<Link
											href="/unfreeze-requests"
											className="text-[length:var(--text-meta)] text-accent hover:underline"
										>
											解除キューへ ›
										</Link>
									) : (
										<InquiryStatusButtons id={inquiry.id} status={inquiry.status} />
									)}
								</TD>
							</TR>
						))}
					</TBody>
				</Table>
			)}
		</div>
	);
}
