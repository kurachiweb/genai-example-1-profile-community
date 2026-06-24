// 公開プロフィールページ。ハンドル名を URL で指定し、ログイン不要で閲覧できる(US-0401, US-0402)。
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { User } from 'lucide-react';
import { getPublicProfile } from '@/lib/api/client';
import { SnsLinks } from '@/components/profile/sns-links';
import { ReportButton } from './report-button';
import { buildDisplayName } from '@lib';

interface Props {
	readonly params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { handle } = await params;
	const profile = await getPublicProfile(handle).catch(() => null);
	if (!profile) return { title: 'プロフィールが見つかりません' };

	const displayName =
		buildDisplayName({
			firstName: profile.firstName ?? '',
			lastName: profile.lastName ?? '',
			order: 'givenNameFirst'
		}) || profile.handle;

	return {
		title: displayName,
		description: profile.bio ?? `${displayName} のプロフィール`,
		openGraph: {
			title: displayName,
			description: profile.bio ?? undefined,
			images: profile.iconUrl ? [{ url: profile.iconUrl }] : undefined,
			type: 'profile'
		}
	};
}

export default async function PublicProfilePage({ params }: Props) {
	const { handle } = await params;
	const profile = await getPublicProfile(handle).catch(() => null);
	if (!profile) notFound();

	const displayName =
		buildDisplayName({
			firstName: profile.firstName ?? '',
			lastName: profile.lastName ?? '',
			order: 'givenNameFirst'
		}) || profile.handle;

	return (
		<div className="mx-auto max-w-2xl px-4 py-12">
			{/* プロフィールカード本体 */}
			<div className="rounded-2xl border border-border bg-surface-raised p-8 shadow-e2">
				<div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
					{/* アイコン */}
					{profile.iconUrl ? (
						<Image
							src={profile.iconUrl}
							alt={`${displayName} のアイコン`}
							width={96}
							height={96}
							className="size-24 shrink-0 rounded-full object-cover ring-2 ring-border"
							priority
						/>
					) : (
						<div
							className="flex size-24 shrink-0 items-center justify-center rounded-full bg-surface ring-2 ring-border"
							aria-hidden="true"
						>
							<User className="size-10 text-text-subtle" />
						</div>
					)}

					{/* 名前・職業 */}
					<div className="min-w-0">
						<h1 className="text-[length:var(--text-heading)] font-bold text-text">{displayName}</h1>
						<p className="text-[length:var(--text-meta)] text-text-muted">@{handle}</p>
						{profile.occupation ? (
							<p className="mt-1 text-[length:var(--text-body)] font-medium text-text-muted">
								{profile.occupation}
							</p>
						) : null}
					</div>
				</div>

				{/* 自己紹介 */}
				{profile.bio ? (
					<p className="mt-6 text-[length:var(--text-body)] whitespace-pre-wrap text-text-muted">
						{profile.bio}
					</p>
				) : null}

				{/* SNS リンク */}
				{profile.snsLinks.length > 0 ? (
					<div className="mt-6">
						<SnsLinks links={profile.snsLinks} />
					</div>
				) : null}
			</div>

			{/* 通報ボタン */}
			<div className="mt-4 flex justify-end">
				<ReportButton handle={handle} />
			</div>
		</div>
	);
}
