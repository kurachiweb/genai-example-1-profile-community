// 通報の審査・処分(BR-ADMIN-005 / BR-SAFE-005)。状態フィルタは URL 状態。未対応/審査中のみ処分操作を出す。
import { Badge, formatRelativeTime } from '@app/frontend-lib';
import { ReportDecisionButtons } from '@/components/moderation/buttons';
import { PageHeader } from '@/components/ui/page-header';
import { StatusFilter } from '@/components/ui/status-filter';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { listReports } from '@/lib/api/admin';
import { reportReasonLabel, reportStatusLabel } from '@/lib/i18n/labels';

const STATUS_OPTIONS: ReadonlyArray<readonly [string, string]> = [
	['OPEN', '未対応'],
	['IN_REVIEW', '審査中'],
	['RESOLVED', '対応済み'],
	['DISMISSED', '却下'],
	['', 'すべて']
];

function statusTone(status: string): 'warning' | 'info' | 'success' | 'neutral' {
	if (status === 'OPEN') return 'warning';
	if (status === 'IN_REVIEW') return 'info';
	if (status === 'RESOLVED') return 'success';
	return 'neutral';
}

export default async function ReportsPage({
	searchParams
}: {
	searchParams: Promise<{ status?: string }>;
}) {
	const params = await searchParams;
	const status = params.status ?? 'OPEN';
	const reports = await listReports(status || undefined);

	return (
		<div>
			<PageHeader title="通報" description="プロフィール通報の審査と処分。" />
			<StatusFilter basePath="/reports" current={status} options={STATUS_OPTIONS} />

			{reports.length === 0 ? (
				<p className="mt-4 rounded-lg border border-dashed border-border px-4 py-12 text-center text-[length:var(--text-meta)] text-text-muted">
					該当する通報はありません。
				</p>
			) : (
				<Table className="mt-4">
					<THead>
						<TR>
							<TH>対象ハンドル</TH>
							<TH>理由</TH>
							<TH>状態</TH>
							<TH className="text-right">集約</TH>
							<TH>受信</TH>
							<TH className="sr-only">操作</TH>
						</TR>
					</THead>
					<TBody>
						{reports.map((report) => {
							const actionable = report.status === 'OPEN' || report.status === 'IN_REVIEW';
							return (
								<TR key={report.id}>
									<TD className="font-medium">@{report.targetHandle}</TD>
									<TD className="text-text-muted">{reportReasonLabel(report.reasonCategory)}</TD>
									<TD>
										<Badge tone={statusTone(report.status)}>
											{reportStatusLabel(report.status)}
										</Badge>
									</TD>
									<TD className="text-right tabular-nums">{report.duplicateCount}</TD>
									<TD className="whitespace-nowrap text-text-muted">
										{formatRelativeTime(report.createdAt)}
									</TD>
									<TD className="text-right">
										{actionable ? <ReportDecisionButtons reportId={report.id} /> : '—'}
									</TD>
								</TR>
							);
						})}
					</TBody>
				</Table>
			)}
		</div>
	);
}
