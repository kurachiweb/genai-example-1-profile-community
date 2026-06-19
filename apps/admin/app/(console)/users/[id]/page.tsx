// ユーザー詳細。状態・登録日・公開状態・通報件数・APIキー数を表示し、重要操作は確認ダイアログ経由(BR-ADMIN-004/005)。
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge, Card, CardTitle, formatDateTime } from '@app/frontend-lib';
import { DeleteIconButton, FreezeUserButton } from '@/components/moderation/buttons';
import { PageHeader } from '@/components/ui/page-header';
import { getUser } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/graphql';
import { userStatusLabel, userStatusTone } from '@/lib/i18n/labels';
import type { UserStatus } from '@/lib/api/types';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-0.5">
			<dt className="text-[length:var(--text-caption)] text-text-muted">{label}</dt>
			<dd className="text-[length:var(--text-meta)] text-text">{children}</dd>
		</div>
	);
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	let user;
	try {
		user = await getUser(id);
	} catch (error) {
		if (error instanceof ApiError && error.code === 'NOT_FOUND') {
			notFound();
		}
		throw error;
	}

	const status = user.status as UserStatus;

	return (
		<div>
			<Link
				href="/users"
				className="mb-4 inline-flex items-center gap-1 text-[length:var(--text-meta)] text-text-muted hover:text-text"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				ユーザー一覧へ戻る
			</Link>

			<PageHeader
				title={user.displayName || user.email}
				description={user.handle ? `@${user.handle}` : 'ハンドル未設定'}
				actions={<Badge tone={userStatusTone(status)}>{userStatusLabel(status)}</Badge>}
			/>

			<div className="grid gap-4 lg:grid-cols-3">
				<Card elevation={1} className="lg:col-span-2">
					<CardTitle as="h2" className="text-[length:var(--text-occupation)]">
						基本情報
					</CardTitle>
					<dl className="mt-4 grid grid-cols-2 gap-4">
						<Field label="メールアドレス">{user.email}</Field>
						<Field label="ハンドル">{user.handle ? `@${user.handle}` : '—'}</Field>
						<Field label="公開状態">{user.visibility ?? '—'}</Field>
						<Field label="登録日時">{formatDateTime(user.createdAt)}</Field>
						<Field label="通報件数">{user.reportCount.toLocaleString('ja-JP')}</Field>
						<Field label="有効APIキー数">{user.apiKeyCount.toLocaleString('ja-JP')}</Field>
					</dl>
				</Card>

				<Card elevation={2}>
					<CardTitle as="h2" className="text-[length:var(--text-occupation)]">
						モデレーション
					</CardTitle>
					<p className="mt-1 text-[length:var(--text-caption)] text-text-muted">
						重要操作は確認のうえ実行され、監査ログに記録されます。
					</p>
					<div className="mt-4 flex flex-col gap-2">
						{status === 'ACTIVE' ? (
							<FreezeUserButton userId={user.id} />
						) : status === 'FROZEN' ? (
							<p className="text-[length:var(--text-meta)] text-text-muted">
								このユーザーは凍結中です。解除は
								<Link href="/unfreeze-requests" className="text-accent hover:underline">
									解除リクエスト
								</Link>
								から審査します。
							</p>
						) : (
							<p className="text-[length:var(--text-meta)] text-text-muted">
								現在の状態({userStatusLabel(status)})では凍結操作はできません。
							</p>
						)}
						<DeleteIconButton userId={user.id} />
					</div>
				</Card>
			</div>
		</div>
	);
}
