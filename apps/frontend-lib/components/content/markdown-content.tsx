// マークダウン本文(規約・お知らせ・ヘルプ記事)を安全に描画するコンポーネント。
// dangerouslySetInnerHTML は使わず、自作パーサ(utilities/markdown)の AST を React 要素へ変換する
// ことで XSS を構造的に防止する(AC-CONTENT-002)。状態やイベントを持たないため Server Component として使える。
import { Fragment } from 'react';
import { cn } from '../../utilities/cn';
import {
	parseMarkdownDocument,
	type BlockNode,
	type InlineNode
} from '../../utilities/markdown';

export interface MarkdownContentProps {
	readonly markdown: string;
	readonly className?: string;
}

const HEADING_CLASSES: Record<number, string> = {
	1: 'text-(length:--text-title) font-bold',
	2: 'text-(length:--text-heading) font-bold',
	3: 'text-(length:--text-subheading) font-semibold',
	4: 'text-(length:--text-body) font-semibold',
	5: 'text-(length:--text-body) font-semibold',
	6: 'text-(length:--text-meta) font-semibold'
};

function InlineNodes({ nodes }: { readonly nodes: InlineNode[] }) {
	return (
		<>
			{nodes.map((node, index) => (
				<Fragment key={index}>
					{node.type === 'text' && node.value}
					{node.type === 'strong' && (
						<strong>
							<InlineNodes nodes={node.children} />
						</strong>
					)}
					{node.type === 'emphasis' && (
						<em>
							<InlineNodes nodes={node.children} />
						</em>
					)}
					{node.type === 'code' && (
						<code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-(length:--text-meta)">
							{node.value}
						</code>
					)}
					{node.type === 'link' && (
						<a
							href={node.href}
							className="text-accent underline underline-offset-2 hover:text-accent/80"
							{...(/^https?:/i.test(node.href)
								? { target: '_blank', rel: 'noopener noreferrer' }
								: {})}
						>
							<InlineNodes nodes={node.children} />
						</a>
					)}
				</Fragment>
			))}
		</>
	);
}

function Block({ node }: { readonly node: BlockNode }) {
	switch (node.type) {
		case 'heading': {
			const Tag = `h${node.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
			return (
				<Tag className={cn('mt-8 mb-3 first:mt-0 text-text', HEADING_CLASSES[node.level])}>
					<InlineNodes nodes={node.children} />
				</Tag>
			);
		}
		case 'paragraph':
			return (
				<p className="mt-3 leading-relaxed text-text-muted first:mt-0">
					<InlineNodes nodes={node.children} />
				</p>
			);
		case 'blockquote':
			return (
				<blockquote className="mt-3 border-l-2 border-border pl-4 text-text-subtle italic">
					<InlineNodes nodes={node.children} />
				</blockquote>
			);
		case 'list': {
			const ListTag = node.ordered ? 'ol' : 'ul';
			return (
				<ListTag className={cn('mt-3 ml-6 space-y-1 text-text-muted', node.ordered ? 'list-decimal' : 'list-disc')}>
					{node.items.map((item, index) => (
						<li key={index}>
							<InlineNodes nodes={item} />
						</li>
					))}
				</ListTag>
			);
		}
		case 'code-block':
			return (
				<pre className="mt-3 overflow-x-auto rounded-md bg-surface-sunken p-4 font-mono text-(length:--text-meta)">
					<code>{node.value}</code>
				</pre>
			);
		case 'thematic-break':
			return <hr className="mt-6 border-border" />;
	}
}

/** マークダウン本文を安全な React 要素として描画する(生 HTML は解釈せずテキストとして扱う)。 */
export function MarkdownContent({ markdown, className }: MarkdownContentProps) {
	const blocks = parseMarkdownDocument(markdown);
	return (
		<div className={cn('text-text', className)}>
			{blocks.map((block, index) => (
				<Block key={index} node={block} />
			))}
		</div>
	);
}
