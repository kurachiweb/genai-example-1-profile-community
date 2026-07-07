// プライバシーポリシーの公開閲覧ページ。ログイン不要(BR-CONTENT-010)。admin で発行した現行版を表示する。
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedPolicy, listPolicyVersions } from '@/lib/api/client';
import { PolicyDocumentView } from '@/components/policy/policy-document-view';

export const metadata: Metadata = {
	title: 'プライバシーポリシー',
	description: 'GenAI Profile Community のプライバシーポリシーです。'
};

export default async function PrivacyPage() {
	const policy = await getPublishedPolicy('privacy');
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
