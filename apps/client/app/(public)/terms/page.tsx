// 利用規約の公開閲覧ページ。ログイン不要(BR-CONTENT-010)。admin で発行した現行版を表示する。
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedPolicy, listPolicyVersions } from '@/lib/api/client';
import { PolicyDocumentView } from '@/components/policy/policy-document-view';

export const metadata: Metadata = {
	title: '利用規約',
	description: 'GenAI Profile Community の利用規約です。'
};

export default async function TermsPage() {
	const policy = await getPublishedPolicy('terms');
	if (!policy) notFound();

	const versions = await listPolicyVersions('terms');

	return (
		<PolicyDocumentView title="利用規約" policy={policy} versions={versions} basePath="/terms" />
	);
}
