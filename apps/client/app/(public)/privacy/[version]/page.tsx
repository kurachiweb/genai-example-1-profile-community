// プライバシーポリシーの過去版閲覧ページ。ログイン不要(BR-CONTENT-010: 過去版も参照可能)。
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPolicyVersion, listPolicyVersions } from '@/lib/api/client';
import { parsePolicyVersionParam } from '@/lib/api/policy-version';
import { PolicyDocumentView } from '@/components/policy/policy-document-view';

interface Props {
	readonly params: Promise<{ version: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { version } = await params;
	return { title: `プライバシーポリシー(第 ${version} 版)` };
}

export default async function PrivacyVersionPage({ params }: Props) {
	const { version } = await params;
	const versionNumber = parsePolicyVersionParam(version);
	if (versionNumber === null) notFound();

	const policy = await getPolicyVersion('privacy', versionNumber);
	if (!policy) notFound();

	const versions = await listPolicyVersions('privacy');

	return (
		<PolicyDocumentView
			title="プライバシーポリシー"
			policy={policy}
			versions={versions}
			basePath="/privacy"
		/>
	);
}
