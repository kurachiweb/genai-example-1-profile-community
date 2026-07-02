// ダッシュボード。統計タイル(上段)＋要対応キュー(下段)。運営の生産性を優先(design 02-layout §6)。
import Link from 'next/link';
import { Eye, Flag, KeyRound, Snowflake, UserCheck, Users } from 'lucide-react';
import { Card, CardTitle, formatRelativeTime } from '@lib';
import { StatTile } from '@/components/dashboard/stat-tile';
import { PageHeader } from '@/components/ui/page-header';
import { getStats, listReports, listUnfreezeRequests } from '@/lib/api/admin';
import { reportReasonLabel } from '@/lib/i18n/labels';

export default async function DashboardPage() {
	// 独立データは並列取得し、親子ウォーターフォールを避ける(ecc-web/patterns)。
	const [stats, openReports, pendingUnfreeze] = await Promise.all([
		getStats(),
		listReports('OPEN'),
		listUnfreezeRequests('PENDING')
	]);

	return (
		<div>
			<PageHeader title="ダッシュボード" description="運営の概況と、対応が必要な項目。" />

			<section
				aria-label="利用統計"
				className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
			>
				<StatTile label="登録ユーザー" value={stats.totalUsers} icon={Users} emphasis />
				<StatTile label="実効公開" value={stats.effectivePublicProfiles} icon={Eye} />
				<StatTile label="アクティブ" value={stats.activeUsers} icon={UserCheck} />
				<StatTile label="凍結中" value={stats.frozenUsers} icon={Snowflake} />
				<StatTile label="未対応の通報" value={stats.openReports} icon={Flag} />
				<StatTile label="有効 API キー" value={stats.activeApiKeys} icon={KeyRound} />
			</section>

			<section className="mt-6 grid gap-4 lg:grid-cols-2">
				<Card elevation={1}>
					<div className="flex items-center justify-between">
						<CardTitle as="h2" className="text-(length:--text-occupation)">
							未処理の通報
						</CardTitle>
						<Link href="/reports" className="text-(length:--text-meta) text-accent hover:underline">
							すべて見る
						</Link>
					</div>
					<ul className="mt-3 divide-y divide-border">
						{openReports.length === 0 ? (
							<li className="py-6 text-center text-(length:--text-meta) text-text-muted">
								未対応の通報はありません。
							</li>
						) : (
							openReports.slice(0, 5).map((report) => (
								<li key={report.id} className="flex items-center justify-between gap-3 py-2.5">
									<div className="min-w-0">
										<p className="truncate text-(length:--text-meta) font-medium text-text">
											@{report.targetHandle}
										</p>
										<p className="text-(length:--text-caption) text-text-muted">
											{reportReasonLabel(report.reasonCategory)}
											{report.duplicateCount > 1 ? `・${report.duplicateCount} 件集約` : ''}
										</p>
									</div>
									<time className="shrink-0 text-(length:--text-caption) text-text-subtle">
										{formatRelativeTime(report.createdAt)}
									</time>
								</li>
							))
						)}
					</ul>
				</Card>

				<Card elevation={1}>
					<div className="flex items-center justify-between">
						<CardTitle as="h2" className="text-(length:--text-occupation)">
							審査待ちの解除リクエスト
						</CardTitle>
						<Link
							href="/unfreeze-requests"
							className="text-(length:--text-meta) text-accent hover:underline"
						>
							すべて見る
						</Link>
					</div>
					<ul className="mt-3 divide-y divide-border">
						{pendingUnfreeze.length === 0 ? (
							<li className="py-6 text-center text-(length:--text-meta) text-text-muted">
								審査待ちのリクエストはありません。
							</li>
						) : (
							pendingUnfreeze.slice(0, 5).map((req) => (
								<li key={req.id} className="flex items-center justify-between gap-3 py-2.5">
									<p className="min-w-0 truncate text-(length:--text-meta) text-text-muted">
										{req.reason}
									</p>
									<time className="shrink-0 text-(length:--text-caption) text-text-subtle">
										{formatRelativeTime(req.createdAt)}
									</time>
								</li>
							))
						)}
					</ul>
				</Card>
			</section>
		</div>
	);
}
