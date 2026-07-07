// マークダウン本文(規約・お知らせ・ヘルプ記事)を安全な AST へ変換する自作パーサ。
// dangerouslySetInnerHTML を一切使わず React 要素として描画するため、構造的に XSS を防止できる
// (AC-CONTENT-002: 生 HTML/スクリプトを含めても実行されない)。npm パッケージは追加しない方針
// (CLAUDE.md: 簡易なユーティリティ関数のための依存追加を避け、車輪の再発明を許容する)。
export type InlineNode =
	| { type: 'text'; value: string }
	| { type: 'strong'; children: InlineNode[] }
	| { type: 'emphasis'; children: InlineNode[] }
	| { type: 'code'; value: string }
	| { type: 'link'; href: string; children: InlineNode[] };

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type BlockNode =
	| { type: 'heading'; level: HeadingLevel; children: InlineNode[] }
	| { type: 'paragraph'; children: InlineNode[] }
	| { type: 'blockquote'; children: InlineNode[] }
	| { type: 'list'; ordered: boolean; items: InlineNode[][] }
	| { type: 'code-block'; value: string }
	| { type: 'thematic-break' };

const SAFE_LINK_SCHEMES = ['http:', 'https:', 'mailto:'];

/** リンク先スキームの許可リスト判定(javascript:/data: 等を拒否)。サイト内相対パス(/…)は許可する。 */
function isSafeHref(href: string): boolean {
	if (href.startsWith('/') && !href.startsWith('//')) return true;
	const lower = href.trim().toLowerCase();
	return SAFE_LINK_SCHEMES.some((scheme) => lower.startsWith(scheme));
}

// リンクの URL 部分は 1 段までの丸括弧のネストを許容する(例: javascript:alert(1) を丸ごと捕捉して安全判定に回す)。
const INLINE_PATTERN =
	/\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]*)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;

/** 太字・斜体・コード・リンクのインライン記法を解析する(未対応記法はプレーンテキスト扱い)。 */
export function parseInline(text: string): InlineNode[] {
	const nodes: InlineNode[] = [];
	let lastIndex = 0;

	for (const match of text.matchAll(INLINE_PATTERN)) {
		const index = match.index ?? 0;
		if (index > lastIndex) {
			nodes.push({ type: 'text', value: text.slice(lastIndex, index) });
		}

		const [, strong, emphasis, code, linkText, linkHref] = match;
		if (strong !== undefined) {
			nodes.push({ type: 'strong', children: parseInline(strong) });
		} else if (emphasis !== undefined) {
			nodes.push({ type: 'emphasis', children: parseInline(emphasis) });
		} else if (code !== undefined) {
			nodes.push({ type: 'code', value: code });
		} else if (linkHref !== undefined) {
			if (isSafeHref(linkHref)) {
				nodes.push({ type: 'link', href: linkHref, children: parseInline(linkText) });
			} else {
				nodes.push(...parseInline(linkText));
			}
		}

		lastIndex = index + match[0].length;
	}

	if (lastIndex < text.length) {
		nodes.push({ type: 'text', value: text.slice(lastIndex) });
	}
	return nodes;
}

const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;
const THEMATIC_BREAK_PATTERN = /^(-{3,}|\*{3,}|_{3,})$/;
const BLOCKQUOTE_PATTERN = /^>\s?/;
const LIST_ITEM_PATTERN = /^\s*([-*]|\d+\.)\s+(.*)$/;
const CODE_FENCE_PATTERN = /^```/;

function isBlockBoundary(line: string): boolean {
	return (
		line.trim() === '' ||
		HEADING_PATTERN.test(line) ||
		THEMATIC_BREAK_PATTERN.test(line.trim()) ||
		BLOCKQUOTE_PATTERN.test(line) ||
		LIST_ITEM_PATTERN.test(line) ||
		CODE_FENCE_PATTERN.test(line)
	);
}

/** マークダウン文書をブロックレベル AST へ変換する。見出し/段落/リスト/引用/コードフェンス/水平線に対応。 */
export function parseMarkdownDocument(source: string): BlockNode[] {
	const normalized = source.replace(/\r\n/g, '\n').trim();
	if (!normalized) return [];

	const lines = normalized.split('\n');
	const blocks: BlockNode[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		if (line.trim() === '') {
			i++;
			continue;
		}

		if (CODE_FENCE_PATTERN.test(line)) {
			const codeLines: string[] = [];
			i++;
			while (i < lines.length && !CODE_FENCE_PATTERN.test(lines[i])) {
				codeLines.push(lines[i]);
				i++;
			}
			i++; // 閉じフェンスを読み飛ばす
			blocks.push({ type: 'code-block', value: codeLines.join('\n') });
			continue;
		}

		if (THEMATIC_BREAK_PATTERN.test(line.trim())) {
			blocks.push({ type: 'thematic-break' });
			i++;
			continue;
		}

		const heading = line.match(HEADING_PATTERN);
		if (heading) {
			blocks.push({
				type: 'heading',
				level: heading[1].length as HeadingLevel,
				children: parseInline(heading[2].trim())
			});
			i++;
			continue;
		}

		if (BLOCKQUOTE_PATTERN.test(line)) {
			const quoteLines: string[] = [];
			while (i < lines.length && BLOCKQUOTE_PATTERN.test(lines[i])) {
				quoteLines.push(lines[i].replace(BLOCKQUOTE_PATTERN, ''));
				i++;
			}
			blocks.push({ type: 'blockquote', children: parseInline(quoteLines.join(' ')) });
			continue;
		}

		const firstItem = line.match(LIST_ITEM_PATTERN);
		if (firstItem) {
			const ordered = /^\d+\.$/.test(firstItem[1]);
			const items: InlineNode[][] = [];
			while (i < lines.length) {
				const item = lines[i].match(LIST_ITEM_PATTERN);
				if (!item || /^\d+\.$/.test(item[1]) !== ordered) break;
				items.push(parseInline(item[2]));
				i++;
			}
			blocks.push({ type: 'list', ordered, items });
			continue;
		}

		const paragraphLines = [line];
		i++;
		while (i < lines.length && !isBlockBoundary(lines[i])) {
			paragraphLines.push(lines[i]);
			i++;
		}
		blocks.push({ type: 'paragraph', children: parseInline(paragraphLines.join(' ')) });
	}

	return blocks;
}
