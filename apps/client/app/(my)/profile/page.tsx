// プロフィール編集ページ。アイコン・氏名・職業・自己紹介・SNS リンク・公開設定を管理する。
import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/require-user';
import { getMyProfile } from '@/lib/api/client';
import { PageHeader } from '@/components/ui/page-header';
import { ProfileForm } from './profile-form';
import { SnsLinksForm } from './sns-links-form';
import { VisibilityToggle } from './visibility-toggle';
import { ShareSection } from './share-section';

export const metadata: Metadata = {
	title: 'プロフィール編集'
};

export default async function ProfilePage() {
	const me = await requireUser();
	const profile = await getMyProfile();

	return (
		<div className="space-y-8">
			<PageHeader
				title="プロフィール編集"
				description="あなたのプロフィールを編集し、世界に公開しましょう。"
			/>

			{/* メール未確認の警告 */}
			{!me.emailVerifiedAt ? (
				<div
					role="alert"
					className="rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-[length:var(--text-meta)] text-warning"
				>
					メールアドレスの確認が完了していません。プロフィールを公開するには確認が必要です。
					受信トレイをご確認ください。
				</div>
			) : null}

			{/* 公開 URL の共有セクション */}
			{profile.handle ? <ShareSection handle={profile.handle} /> : null}

			{/* 公開設定 */}
			<section aria-labelledby="visibility-heading">
				<h2
					id="visibility-heading"
					className="mb-3 text-[length:var(--text-title)] font-semibold text-text"
				>
					公開設定
				</h2>
				<VisibilityToggle
					currentVisibility={profile.visibility}
					isEmailVerified={!!me.emailVerifiedAt}
				/>
			</section>

			{/* プロフィール基本情報 */}
			<section aria-labelledby="profile-heading">
				<h2
					id="profile-heading"
					className="mb-3 text-[length:var(--text-title)] font-semibold text-text"
				>
					基本情報
				</h2>
				<ProfileForm profile={profile} />
			</section>

			{/* SNS リンク */}
			<section aria-labelledby="sns-heading">
				<h2
					id="sns-heading"
					className="mb-3 text-[length:var(--text-title)] font-semibold text-text"
				>
					SNS リンク
				</h2>
				<SnsLinksForm snsLinks={profile.snsLinks} />
			</section>
		</div>
	);
}
