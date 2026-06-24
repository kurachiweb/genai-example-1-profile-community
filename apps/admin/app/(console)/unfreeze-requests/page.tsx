// 解除リクエストの審査(BR-ADMIN-006 / BR-SAFE-008)。審査待ちのみ承認/却下操作を出す。
import Link from 'next/link';
import { Badge, formatRelativeTime } from '@lib';
import { UnfreezeDecisionButtons } from '@/components/moderation/buttons';
import { PageHeader } from '@/components/ui/page-header';
import { StatusFilter } from '@/components/ui/status-filter';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { listUnfreezeRequests } from '@/lib/api/admin';
import { unfreezeStatusLabel } from '@/lib/i18n/labels';

const STATUS_OPTIONS: ReadonlyArray<readonly [string, string]> = [
	['PENDING', '審査待ち'],
	['APPROVED', '承認'],
	['REJECTED', '却下'],
	['', 'すべて']
];

function statusTone(status: string): 'warning' | 'success' | 'neutral' {
	if (status === 'PENDING') return 'warning';
	if (status === 'APPROVED') return 'success';
	return 'neutral';
}

export default async function UnfreezeRequestsPage({
	searchParams
}: {
	searchParams: Promise<{ status?: string }>;
}) {
	const params = await searchParams;
	const status = params.status ?? 'PENDING';
	const requests = await listUnfreezeRequests(status || undefined);

	return (
		<div>
			<PageHeader title="解除リクエスト" description="凍結ユーザーからの解除申請を審査します。" />
			<StatusFilter basePath="/unfreeze-requests" current={status} options={STATUS_OPTIONS} />

			{requests.length === 0 ? (
				<p className="mt-4 rounded-lg border border-dashed border-border px-4 py-12 text-center text-[length:var(--text-meta)] text-text-muted">
					該当する解除リクエストはありません。
				</p>
			) : (
				<Table className="mt-4">
					<THead>
						<TR>
							<TH>申請者</TH>
							<TH>理由</TH>
							<TH>状態</TH>
							<TH>申請日</TH>
							<TH className="sr-only">操作</TH>
						</TR>
					</THead>
					<TBody>
						{requests.map((request) => (
							<TR key={request.id}>
								<TD>
									<Link
										href={`/users/${request.userId}`}
										className="font-medium text-accent hover:underline"
									>
										{request.userId}
									</Link>
								</TD>
								<TD className="max-w-md text-text-muted">
									<p className="line-clamp-2">{request.reason}</p>
								</TD>
								<TD>
									<Badge tone={statusTone(request.status)}>
										{unfreezeStatusLabel(request.status)}
									</Badge>
								</TD>
								<TD className="whitespace-nowrap text-text-muted">
									{formatRelativeTime(request.createdAt)}
								</TD>
								<TD className="text-right">
									{request.status === 'PENDING' ? (
										<UnfreezeDecisionButtons requestId={request.id} />
									) : (
										'—'
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
