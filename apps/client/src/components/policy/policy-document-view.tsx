// 規約・プライバシーポリシーの公開閲覧ビュー(BR-CONTENT-010)。現行版・過去版で共通利用する。
import Link from 'next/link';
import { formatDate, MarkdownContent } from '@lib';
import type { PolicyDocument } from '@/lib/api/types';

export interface PolicyDocumentViewProps {
	readonly title: string;
	readonly policy: PolicyDocument;
	readonly versions: readonly PolicyDocument[];
	/** 現行版ページの URL(例: /terms)。過去版一覧・案内リンクの基点にする。 */
	readonly basePath: string;
}

export function PolicyDocumentView({ title, policy, versions, basePath }: PolicyDocumentViewProps) {
	const pastVersions = versions.filter((v) => v.version !== policy.version);

	return (
		<article className="mx-auto max-w-3xl px-4 py-12">
			{/* 見出し(h1)は本文マークダウン側が持つ想定(発行した文書をそのまま表示するため)。
			    ここでは種別・版・発効日のメタ情報のみを補助的に示す。 */}
			<header className="mb-8 border-b border-border pb-6">
				<p className="text-(length:--text-caption) font-semibold tracking-wide text-text-subtle uppercase">
					{title}
				</p>
				<p className="mt-2 text-(length:--text-meta) text-text-muted">
					第 {policy.version} 版・発効日 {formatDate(policy.effectiveDate)}
				</p>
				{!policy.isPublished && (
					<p
						role="status"
						className="mt-3 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-(length:--text-meta) text-warning"
					>
						これは過去に発効していた版です。
						<Link href={basePath} className="ml-1 underline underline-offset-2">
							最新版を見る
						</Link>
					</p>
				)}
			</header>

			<MarkdownContent markdown={policy.bodyMarkdown} />

			{pastVersions.length > 0 && (
				<footer className="mt-12 border-t border-border pt-6">
					<h2 className="text-(length:--text-subheading) font-semibold text-text">改定履歴</h2>
					<ul className="mt-3 space-y-1.5 text-(length:--text-meta)">
						{pastVersions.map((version) => (
							<li key={version.version}>
								<Link
									href={`${basePath}/${version.version}`}
									className="text-accent underline-offset-2 hover:underline"
								>
									第 {version.version} 版({formatDate(version.effectiveDate)}
									{version.isPublished ? '・現行' : ''})
								</Link>
							</li>
						))}
					</ul>
				</footer>
			)}
		</article>
	);
}
