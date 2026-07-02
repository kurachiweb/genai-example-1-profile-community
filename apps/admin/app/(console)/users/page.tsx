// ユーザー一覧。メール/ハンドル検索・状態フィルタ・ページングを URL 状態で保持する(ecc-web/patterns)。
// 行クリックで詳細ページへ(ユーザー選択のテーブルパターン)。
import Link from 'next/link';
import { Badge, Button, formatDate } from '@lib';
import { PageHeader } from '@/components/ui/page-header';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { listUsers } from '@/lib/api/admin';
import { userStatusLabel, userStatusTone } from '@/lib/i18n/labels';
import type { UserStatus } from '@/lib/api/types';

const PAGE_SIZE = 20;
const STATUS_OPTIONS: ReadonlyArray<readonly [string, string]> = [
	['', 'すべての状態'],
	['UNVERIFIED', '未確認'],
	['ACTIVE', '有効'],
	['FROZEN', '凍結'],
	['WITHDRAWN', '退会済み']
];

interface SearchParams {
	search?: string;
	status?: string;
	offset?: string;
}

function buildHref(base: SearchParams, offset: number): string {
	const params = new URLSearchParams();
	if (base.search) params.set('search', base.search);
	if (base.status) params.set('status', base.status);
	if (offset > 0) params.set('offset', String(offset));
	const query = params.toString();
	return query ? `/users?${query}` : '/users';
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const params = await searchParams;
	const offset = Math.max(Number(params.offset ?? 0) || 0, 0);
	const { users, total } = await listUsers({
		search: params.search,
		status: params.status,
		limit: PAGE_SIZE,
		offset
	});
	const hasPrev = offset > 0;
	const hasNext = offset + PAGE_SIZE < total;

	return (
		<div>
			<PageHeader
				title="ユーザー管理"
				description={`登録ユーザーの一覧・検索。全 ${total.toLocaleString('ja-JP')} 件。`}
			/>

			<form method="get" className="mb-4 flex flex-wrap items-end gap-2">
				<label className="flex flex-col gap-1 text-(length:--text-meta)">
					<span className="text-text-muted">メール・ハンドル検索</span>
					<input
						type="search"
						name="search"
						defaultValue={params.search ?? ''}
						placeholder="例: example@…, handle"
						className="h-10 w-64 rounded-md border border-border bg-surface-raised px-3 text-text outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-focus-ring"
					/>
				</label>
				<label className="flex flex-col gap-1 text-(length:--text-meta)">
					<span className="text-text-muted">状態</span>
					<select
						name="status"
						defaultValue={params.status ?? ''}
						className="h-10 rounded-md border border-border bg-surface-raised px-3 text-text"
					>
						{STATUS_OPTIONS.map(([value, label]) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</select>
				</label>
				<Button type="submit" variant="outline">
					絞り込む
				</Button>
			</form>

			{users.length === 0 ? (
				<p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-(length:--text-meta) text-text-muted">
					該当するユーザーがいません。検索条件を見直してください。
				</p>
			) : (
				<Table>
					<THead>
						<TR>
							<TH>メールアドレス</TH>
							<TH>ハンドル</TH>
							<TH>状態</TH>
							<TH className="text-right">通報</TH>
							<TH className="text-right">APIキー</TH>
							<TH>登録日</TH>
							<TH className="sr-only">詳細</TH>
						</TR>
					</THead>
					<TBody>
						{users.map((user) => (
							<TR key={user.id}>
								<TD className="font-medium">{user.email}</TD>
								<TD className="text-text-muted">{user.handle ? `@${user.handle}` : '—'}</TD>
								<TD>
									<Badge tone={userStatusTone(user.status as UserStatus)}>
										{userStatusLabel(user.status as UserStatus)}
									</Badge>
								</TD>
								<TD className="text-right tabular-nums">{user.reportCount}</TD>
								<TD className="text-right tabular-nums">{user.apiKeyCount}</TD>
								<TD className="whitespace-nowrap text-text-muted">{formatDate(user.createdAt)}</TD>
								<TD className="text-right">
									<Link
										href={`/users/${user.id}`}
										className="text-(length:--text-meta) text-accent hover:underline"
									>
										詳細 ›
									</Link>
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
						<Link href={buildHref(params, Math.max(offset - PAGE_SIZE, 0))}>前へ</Link>
					</Button>
					<Button asChild variant="ghost" size="sm" aria-disabled={!hasNext}>
						<Link href={buildHref(params, offset + PAGE_SIZE)}>次へ</Link>
					</Button>
				</div>
			</nav>
		</div>
	);
}
