// 規約・プライバシーポリシーの版管理(BR-CONTENT-008)。super_admin が新版作成・発効。過去版は履歴保持。
import Link from 'next/link';
import { Badge, cn, formatDate } from '@app/frontend-lib';
import { PolicyVersionForm, PublishPolicyButton } from '@/components/content/policies';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { getMe } from '@/lib/api/admin';
import { listPolicies } from '@/lib/api/content';
import { policyTypeLabel } from '@/lib/i18n/labels';

const TYPES: ReadonlyArray<readonly [string, string]> = [
	['terms', '利用規約'],
	['privacy', 'プライバシーポリシー']
];

export default async function PoliciesPage({
	searchParams
}: {
	searchParams: Promise<{ type?: string }>;
}) {
	const { type: rawType } = await searchParams;
	const type = rawType === 'privacy' ? 'privacy' : 'terms';
	const [me, policies] = await Promise.all([getMe(), listPolicies(type)]);
	const canManage = me.role === 'super_admin';

	return (
		<div>
			<PageHeader
				title="規約・ポリシー"
				description={`${policyTypeLabel(type)}の版管理。公開中は 1 版のみ、過去版は履歴として保持されます。`}
				actions={canManage ? <PolicyVersionForm type={type} /> : undefined}
			/>

			<div role="tablist" aria-label="ポリシー種別" className="mb-4 flex gap-1">
				{TYPES.map(([value, label]) => {
					const active = type === value;
					return (
						<Link
							key={value}
							href={`/policies?type=${value}`}
							aria-current={active ? 'page' : undefined}
							className={cn(
								'rounded-md px-3 py-1.5 text-[length:var(--text-meta)] font-medium transition-colors',
								active
									? 'bg-accent text-accent-contrast'
									: 'text-text-muted hover:bg-surface-sunken hover:text-text'
							)}
						>
							{label}
						</Link>
					);
				})}
			</div>

			{policies.length === 0 ? (
				<p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-[length:var(--text-meta)] text-text-muted">
					この種別の版はまだありません。
				</p>
			) : (
				<Table>
					<THead>
						<TR>
							<TH>版</TH>
							<TH>状態</TH>
							<TH>再同意</TH>
							<TH>発効日</TH>
							<TH>作成日</TH>
							{canManage ? <TH className="sr-only">操作</TH> : null}
						</TR>
					</THead>
					<TBody>
						{policies.map((policy) => (
							<TR key={policy.id}>
								<TD className="font-medium tabular-nums">v{policy.version}</TD>
								<TD>
									<Badge tone={policy.isPublished ? 'success' : 'neutral'}>
										{policy.isPublished ? '公開中' : '下書き'}
									</Badge>
								</TD>
								<TD>{policy.requiresReconsent ? <Badge tone="warning">要再同意</Badge> : '—'}</TD>
								<TD className="whitespace-nowrap text-text-muted">
									{formatDate(policy.effectiveDate)}
								</TD>
								<TD className="whitespace-nowrap text-text-muted">
									{formatDate(policy.createdAt)}
								</TD>
								{canManage ? (
									<TD className="text-right">
										{policy.isPublished ? '—' : <PublishPolicyButton id={policy.id} />}
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
