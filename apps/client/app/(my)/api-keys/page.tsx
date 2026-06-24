// API キー管理ページ。キーの一覧・発行・失効を管理する(US-0501)。
import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/require-user';
import { listMyApiKeys } from '@/lib/api/client';
import { PageHeader } from '@/components/ui/page-header';
import { ApiKeyList } from './api-key-list';
import { CreateApiKeyButton } from './create-api-key-button';

export const metadata: Metadata = {
	title: 'API キー管理'
};

export default async function ApiKeysPage() {
	await requireUser();
	const keys = await listMyApiKeys();

	return (
		<div className="space-y-6">
			<PageHeader
				title="API キー管理"
				description="公開 API へアクセスするためのキーを管理します。"
				actions={<CreateApiKeyButton />}
			/>

			<section aria-label="API キー一覧">
				<ApiKeyList keys={keys} />
			</section>

			<section aria-labelledby="api-info-heading">
				<h2
					id="api-info-heading"
					className="mb-2 text-[length:var(--text-title)] font-semibold text-text"
				>
					API について
				</h2>
				<div className="space-y-2 rounded-xl border border-border bg-surface-raised p-5 text-[length:var(--text-meta)] text-text-muted">
					<p>
						<strong className="text-text">read スコープ:</strong>{' '}
						プロフィールの読み取り専用アクセス。
					</p>
					<p>
						<strong className="text-text">full スコープ:</strong>{' '}
						プロフィールの読み取り・更新・削除アクセス。
					</p>
					<p>
						レート制限: 1 分あたり最大 60 リクエスト（デフォルト）。
						レスポンスヘッダーで残り回数を確認できます。
					</p>
				</div>
			</section>
		</div>
	);
}
