// セキュリティ設定: パスキー(WebAuthn)の登録・一覧・削除(BR-COMMON-016・AC-ADMIN-013)。
// 任意かつ推奨。最後のパスキーを削除してもメール＋パスワードで継続できる。
import { Card, CardDescription, CardTitle, formatDateTime } from '@lib';
import { DeletePasskeyButton, RegisterPasskeyButton } from '@/components/security/passkeys';
import { PageHeader } from '@/components/ui/page-header';
import { listPasskeys } from '@/lib/api/admin';

export default async function PasskeysPage() {
	const passkeys = await listPasskeys();

	return (
		<div>
			<PageHeader
				title="セキュリティ"
				description="パスキー(WebAuthn)の登録・管理。任意ですが、より安全なログインのため推奨します。"
			/>

			<Card elevation={1} className="mb-6">
				<CardTitle as="h2" className="text-[length:var(--text-occupation)]">
					パスキーを登録
				</CardTitle>
				<CardDescription>
					対応する認証器(指紋・顔認証・セキュリティキー)でパスキーを登録します。登録は監査ログに記録されます。
				</CardDescription>
				<div className="mt-4">
					<RegisterPasskeyButton />
				</div>
			</Card>

			<Card elevation={1}>
				<CardTitle as="h2" className="text-[length:var(--text-occupation)]">
					登録済みのパスキー
				</CardTitle>
				{passkeys.length === 0 ? (
					<p className="mt-4 text-[length:var(--text-meta)] text-text-muted">
						まだパスキーは登録されていません。
					</p>
				) : (
					<ul className="mt-4 divide-y divide-border">
						{passkeys.map((passkey) => (
							<li key={passkey.id} className="flex items-center justify-between gap-3 py-3">
								<div className="min-w-0">
									<p className="text-[length:var(--text-meta)] font-medium text-text">
										{passkey.nickname || '名称未設定のパスキー'}
									</p>
									<p className="text-[length:var(--text-caption)] text-text-subtle">
										登録 {formatDateTime(passkey.createdAt)}
										{passkey.lastUsedAt ? ` ・ 最終利用 ${formatDateTime(passkey.lastUsedAt)}` : ''}
									</p>
								</div>
								<DeletePasskeyButton id={passkey.id} />
							</li>
						))}
					</ul>
				)}
			</Card>
		</div>
	);
}
