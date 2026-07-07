// 利用規約の過去版閲覧ページ。ログイン不要(BR-CONTENT-010: 過去版も参照可能)。
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
	return { title: `利用規約(第 ${version} 版)` };
}

export default async function TermsVersionPage({ params }: Props) {
	const { version } = await params;
	const versionNumber = parsePolicyVersionParam(version);
	if (versionNumber === null) notFound();

	const policy = await getPolicyVersion('terms', versionNumber);
	if (!policy) notFound();

	const versions = await listPolicyVersions('terms');

	return (
		<PolicyDocumentView title="利用規約" policy={policy} versions={versions} basePath="/terms" />
	);
}
