// 監査ログ閲覧(BR-ADMIN-010 / AC-ADMIN-011)。追記専用のため編集/削除手段は提供しない。絞り込み・ページングは URL 状態。
import { Badge, Button, formatDateTime } from '@lib';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { listAuditLogs } from '@/lib/api/admin';
import { auditEventLabel } from '@/lib/i18n/labels';

const PAGE_SIZE = 30;
const ACTOR_OPTIONS: ReadonlyArray<readonly [string, string]> = [
	['', 'すべての操作者'],
	['admin', '管理者'],
	['user', '利用者'],
	['system', 'システム']
];

interface SearchParams {
	actorType?: string;
	eventType?: string;
	targetId?: string;
	offset?: string;
}

function buildHref(base: SearchParams, offset: number): string {
	const params = new URLSearchParams();
	if (base.actorType) params.set('actorType', base.actorType);
	if (base.eventType) params.set('eventType', base.eventType);
	if (base.targetId) params.set('targetId', base.targetId);
	if (offset > 0) params.set('offset', String(offset));
	const query = params.toString();
	return query ? `/audit-logs?${query}` : '/audit-logs';
}

function formatMetadata(metadataJson: string | null): string {
	if (!metadataJson) return '—';
	try {
		const parsed = JSON.parse(metadataJson) as Record<string, unknown>;
		return Object.entries(parsed)
			.map(([key, value]) => `${key}: ${String(value)}`)
			.join(' / ');
	} catch {
		return metadataJson;
	}
}

export default async function AuditLogsPage({
	searchParams
}: {
	searchParams: Promise<SearchParams>;
}) {
	const params = await searchParams;
	const offset = Math.max(Number(params.offset ?? 0) || 0, 0);
	const { logs, total } = await listAuditLogs({
		actorType: params.actorType,
		eventType: params.eventType,
		targetId: params.targetId,
		limit: PAGE_SIZE,
		offset
	});
	const hasPrev = offset > 0;
	const hasNext = offset + PAGE_SIZE < total;

	return (
		<div>
			<PageHeader
				title="監査ログ"
				description={`改ざん不可・追記専用の操作記録。全 ${total.toLocaleString('ja-JP')} 件。`}
			/>

			<form method="get" className="mb-4 flex flex-wrap items-end gap-2">
				<label className="flex flex-col gap-1 text-(length:--text-meta)">
					<span className="text-text-muted">操作者種別</span>
					<select
						name="actorType"
						defaultValue={params.actorType ?? ''}
						className="h-10 rounded-md border border-border bg-surface-raised px-3 text-text"
					>
						{ACTOR_OPTIONS.map(([value, label]) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</select>
				</label>
				<label className="flex flex-col gap-1 text-(length:--text-meta)">
					<span className="text-text-muted">イベント種別</span>
					<input
						type="text"
						name="eventType"
						defaultValue={params.eventType ?? ''}
						placeholder="例: user.frozen"
						className="h-10 w-52 rounded-md border border-border bg-surface-raised px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
					/>
				</label>
				<label className="flex flex-col gap-1 text-(length:--text-meta)">
					<span className="text-text-muted">対象 ID</span>
					<input
						type="text"
						name="targetId"
						defaultValue={params.targetId ?? ''}
						className="h-10 w-52 rounded-md border border-border bg-surface-raised px-3 text-text outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
					/>
				</label>
				<Button type="submit" variant="outline">
					絞り込む
				</Button>
			</form>

			{logs.length === 0 ? (
				<p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-(length:--text-meta) text-text-muted">
					該当する記録はありません。
				</p>
			) : (
				<Table>
					<THead>
						<TR>
							<TH>日時</TH>
							<TH>イベント</TH>
							<TH>操作者</TH>
							<TH>対象</TH>
							<TH>結果</TH>
							<TH>詳細</TH>
						</TR>
					</THead>
					<TBody>
						{logs.map((log) => (
							<TR key={log.id}>
								<TD className="whitespace-nowrap text-text-muted">
									{formatDateTime(log.occurredAt)}
								</TD>
								<TD className="font-medium">{auditEventLabel(log.eventType)}</TD>
								<TD className="text-text-muted">
									{log.actorType}
									{log.actorId ? ` (${log.actorId})` : ''}
								</TD>
								<TD className="text-text-muted">
									{log.targetType ? `${log.targetType}: ${log.targetId ?? '—'}` : '—'}
								</TD>
								<TD>
									<Badge tone={log.result === 'success' ? 'success' : 'danger'}>{log.result}</Badge>
								</TD>
								<TD className="max-w-xs truncate text-(length:--text-caption) text-text-subtle">
									{formatMetadata(log.metadataJson)}
								</TD>
							</TR>
						))}
					</TBody>
				</Table>
			)}

			<nav
				className="mt-4 flex items-center justify-between text-(length:--text-meta)"
				aria-label="ページング"
			>
				<span className="text-text-muted">
					{total === 0 ? 0 : offset + 1}–{Math.min(offset + PAGE_SIZE, total)} / {total}
				</span>
				<div className="flex gap-2">
					<Button asChild variant="ghost" size="sm" aria-disabled={!hasPrev}>
						<a href={buildHref(params, Math.max(offset - PAGE_SIZE, 0))}>前へ</a>
					</Button>
					<Button asChild variant="ghost" size="sm" aria-disabled={!hasNext}>
						<a href={buildHref(params, offset + PAGE_SIZE)}>次へ</a>
					</Button>
				</div>
			</nav>
		</div>
	);
}
