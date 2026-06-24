// ホームページ。サービスのランディングページとプロフィール一覧への導線。
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Globe, Share2, UserCheck } from 'lucide-react';
import { Button } from '@app/frontend-lib';
import { listPublicProfiles } from '@/lib/api/client';
import { ProfileCard } from '@/components/profile/profile-card';

export const metadata: Metadata = {
	title: 'GenAI Profile Community — AIが切り拓くプロフィール共有',
	description: 'アイコン・名前・職業・SNSリンクを一つのページで共有。GenAI Profile Community。'
};

export default async function HomePage() {
	// 最新プロフィールを最大 6 件だけ表示する。
	const { profiles } = await listPublicProfiles({ limit: 6 }).catch(() => ({ profiles: [] }));

	return (
		<>
			{/* ヒーローセクション */}
			<section
				aria-labelledby="hero-heading"
				className="relative overflow-hidden bg-surface px-4 py-20 text-center md:py-32"
			>
				{/* 背景アクセント(装飾) */}
				<div
					className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,theme(colors.accent/0.12),transparent)]"
					aria-hidden="true"
				/>

				<div className="mx-auto max-w-2xl">
					<div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-[length:var(--text-caption)] text-text-muted">
						<span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
						プロフィール共有サービス
					</div>
					<h1
						id="hero-heading"
						className="mt-2 text-[length:var(--text-display)] leading-tight font-bold tracking-tight text-text"
					>
						あなたのプロフィールを、
						<br className="hidden sm:block" />
						世界に届けよう
					</h1>
					<p className="mt-4 text-[length:var(--text-body)] text-text-muted">
						アイコン・名前・職業・自己紹介・SNS リンクを一つのページで共有。 固有 URL
						で名刺や署名に貼れる、シンプルなプロフィールサービス。
					</p>
					<div className="mt-8 flex flex-wrap justify-center gap-3">
						<Link href="/register">
							<Button size="lg">
								無料で始める
								<ArrowRight className="ml-1.5 size-4" aria-hidden="true" />
							</Button>
						</Link>
						<Link href="/profiles">
							<Button variant="outline" size="lg">
								プロフィールを見る
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* 特徴 */}
			<section aria-labelledby="features-heading" className="bg-surface-raised px-4 py-16">
				<div className="mx-auto max-w-5xl">
					<h2
						id="features-heading"
						className="text-center text-[length:var(--text-heading)] font-bold text-text"
					>
						シンプルで使いやすい
					</h2>
					<div className="mt-10 grid gap-6 sm:grid-cols-3">
						<div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6 text-center">
							<div className="flex size-10 items-center justify-center rounded-full bg-accent/10">
								<UserCheck className="size-5 text-accent" aria-hidden="true" />
							</div>
							<h3 className="font-semibold text-text">かんたん登録</h3>
							<p className="text-[length:var(--text-meta)] text-text-muted">
								メールアドレスだけで登録完了。すぐにプロフィールを設定できます。
							</p>
						</div>
						<div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6 text-center">
							<div className="flex size-10 items-center justify-center rounded-full bg-accent/10">
								<Share2 className="size-5 text-accent" aria-hidden="true" />
							</div>
							<h3 className="font-semibold text-text">固有 URL で共有</h3>
							<p className="text-[length:var(--text-meta)] text-text-muted">
								自分だけの URL で名刺・署名・SNS に貼れます。QR コードにも対応。
							</p>
						</div>
						<div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6 text-center">
							<div className="flex size-10 items-center justify-center rounded-full bg-accent/10">
								<Globe className="size-5 text-accent" aria-hidden="true" />
							</div>
							<h3 className="font-semibold text-text">公開 API 対応</h3>
							<p className="text-[length:var(--text-meta)] text-text-muted">
								API キーを発行してプログラムからプロフィールを取得・更新できます。
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* 最新プロフィール */}
			{profiles.length > 0 && (
				<section aria-labelledby="recent-heading" className="bg-surface px-4 py-16">
					<div className="mx-auto max-w-5xl">
						<div className="mb-8 flex items-center justify-between">
							<h2
								id="recent-heading"
								className="text-[length:var(--text-heading)] font-bold text-text"
							>
								最近のプロフィール
							</h2>
							<Link
								href="/profiles"
								className="text-[length:var(--text-meta)] text-accent hover:underline"
							>
								すべて見る
							</Link>
						</div>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{profiles.map((profile) => (
								<ProfileCard key={profile.handle} profile={profile} />
							))}
						</div>
					</div>
				</section>
			)}
		</>
	);
}
