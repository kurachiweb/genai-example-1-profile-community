// 公開 API キー運用(BR-ADMIN-007/008)。メタ情報のみ表示し秘匿値は扱わない。失効・しきい値変更は権限で出し分け。
import { Badge, Card, CardDescription, CardTitle, formatDate, formatDateTime } from '@lib';
import { RateLimitControl, RevokeKeyButton } from '@/components/ops/buttons';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { getMe, getRateLimit, listApiKeys } from '@/lib/api/admin';
import { apiKeyStatusLabel } from '@/lib/i18n/labels';

export default async function ApiKeysPage() {
	const [me, keys, rateLimit] = await Promise.all([getMe(), listApiKeys(), getRateLimit()]);
	const canRevoke = me.role === 'super_admin' || me.role === 'moderator';
	const canChangeRateLimit = me.role === 'super_admin';

	return (
		<div>
			<PageHeader
				title="API キー運用"
				description="発行済みキーのメタ情報の監視と、共通レート制限の管理。"
			/>

			<Card elevation={1} className="mb-6">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<CardTitle as="h2" className="text-[length:var(--text-occupation)]">
							共通レート制限
						</CardTitle>
						<CardDescription>
							全キー共通の 1 分あたりリクエスト数(@nestjs/throttler)。
						</CardDescription>
						<p className="mt-2 text-3xl font-bold text-text tabular-nums">
							{rateLimit.toLocaleString('ja-JP')}
							<span className="ml-1 text-[length:var(--text-meta)] font-normal text-text-muted">
								リクエスト / 分
							</span>
						</p>
					</div>
					{canChangeRateLimit ? <RateLimitControl current={rateLimit} /> : null}
				</div>
			</Card>

			{keys.length === 0 ? (
				<p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-[length:var(--text-meta)] text-text-muted">
					発行済みの API キーはありません。
				</p>
			) : (
				<Table>
					<THead>
						<TR>
							<TH>所有者</TH>
							<TH>ラベル</TH>
							<TH>スコープ</TH>
							<TH>状態</TH>
							<TH>最終利用</TH>
							<TH>作成日</TH>
							{canRevoke ? <TH className="sr-only">操作</TH> : null}
						</TR>
					</THead>
					<TBody>
						{keys.map((key) => (
							<TR key={key.id}>
								<TD className="font-medium">{key.ownerEmail ?? key.userId}</TD>
								<TD className="text-text-muted">{key.label ?? '—'}</TD>
								<TD>
									<Badge tone={key.scope === 'full' ? 'accent' : 'outline'}>{key.scope}</Badge>
								</TD>
								<TD>
									<Badge tone={key.status === 'active' ? 'success' : 'neutral'}>
										{apiKeyStatusLabel(key.status)}
									</Badge>
								</TD>
								<TD className="whitespace-nowrap text-text-muted">
									{key.lastUsedAt ? formatDateTime(key.lastUsedAt) : '未使用'}
								</TD>
								<TD className="whitespace-nowrap text-text-muted">{formatDate(key.createdAt)}</TD>
								{canRevoke ? (
									<TD className="text-right">
										{key.status === 'active' ? <RevokeKeyButton keyId={key.id} /> : '—'}
									</TD>
								) : null}
							</TR>
						))}
					</TBody>
				</Table>
			)}
		</div>
	);
}
