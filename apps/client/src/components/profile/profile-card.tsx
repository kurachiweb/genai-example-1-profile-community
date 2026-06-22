// プロフィールカード。公開プロフィール一覧で使用するサマリーカード。
import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';
import type { PublicProfileSummary } from '@/lib/api/types';
import { buildDisplayName } from '@app/frontend-lib';

interface Props {
	readonly profile: PublicProfileSummary;
}

export function ProfileCard({ profile }: Props) {
	const displayName = buildDisplayName({
		firstName: profile.firstName,
		lastName: profile.lastName,
		handle: profile.handle
	});

	return (
		<Link
			href={`/${profile.handle}`}
			className="group flex flex-col gap-3 rounded-xl border border-border bg-surface-raised p-5 transition-shadow hover:shadow-e2"
		>
			<div className="flex items-center gap-3">
				{profile.iconUrl ? (
					<Image
						src={profile.iconUrl}
						alt={`${displayName} のアイコン`}
						width={48}
						height={48}
						className="size-12 rounded-full object-cover"
					/>
				) : (
					<div
						className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface text-text-subtle"
						aria-hidden="true"
					>
						<User className="size-5" />
					</div>
				)}
				<div className="min-w-0">
					<p className="truncate font-semibold text-text group-hover:text-accent">
						{displayName}
					</p>
					{profile.occupation ? (
						<p className="truncate text-[length:var(--text-caption)] text-text-muted">
							{profile.occupation}
						</p>
					) : null}
				</div>
			</div>
			{profile.bio ? (
				<p className="line-clamp-2 text-[length:var(--text-meta)] text-text-muted">{profile.bio}</p>
			) : null}
		</Link>
	);
}
