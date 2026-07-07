import { parseInline, parseMarkdownDocument } from './markdown';

describe('parseMarkdownDocument', () => {
	test('空文字列は空配列を返す', () => {
		expect(parseMarkdownDocument('')).toEqual([]);
		expect(parseMarkdownDocument('   \n  ')).toEqual([]);
	});

	test('見出し(#〜######)を解析する', () => {
		const blocks = parseMarkdownDocument('# 第1条\n\n## 第1項');
		expect(blocks).toEqual([
			{ type: 'heading', level: 1, children: [{ type: 'text', value: '第1条' }] },
			{ type: 'heading', level: 2, children: [{ type: 'text', value: '第1項' }] }
		]);
	});

	test('段落は連続する行を 1 つにまとめる', () => {
		const blocks = parseMarkdownDocument('これは本文です。\n続きの行です。');
		expect(blocks).toEqual([
			{
				type: 'paragraph',
				children: [{ type: 'text', value: 'これは本文です。 続きの行です。' }]
			}
		]);
	});

	test('空行で段落が分かれる', () => {
		const blocks = parseMarkdownDocument('段落1\n\n段落2');
		expect(blocks).toHaveLength(2);
		expect(blocks[0]).toEqual({
			type: 'paragraph',
			children: [{ type: 'text', value: '段落1' }]
		});
	});

	test('箇条書き(-)を解析する', () => {
		const blocks = parseMarkdownDocument('- 項目A\n- 項目B');
		expect(blocks).toEqual([
			{
				type: 'list',
				ordered: false,
				items: [[{ type: 'text', value: '項目A' }], [{ type: 'text', value: '項目B' }]]
			}
		]);
	});

	test('番号付きリスト(1.)を解析する', () => {
		const blocks = parseMarkdownDocument('1. 最初\n2. 次');
		expect(blocks).toEqual([
			{
				type: 'list',
				ordered: true,
				items: [[{ type: 'text', value: '最初' }], [{ type: 'text', value: '次' }]]
			}
		]);
	});

	test('引用(>)を解析する', () => {
		const blocks = parseMarkdownDocument('> 引用文');
		expect(blocks).toEqual([
			{ type: 'blockquote', children: [{ type: 'text', value: '引用文' }] }
		]);
	});

	test('水平線(---)を解析する', () => {
		expect(parseMarkdownDocument('---')).toEqual([{ type: 'thematic-break' }]);
	});

	test('コードフェンスの中身はそのまま保持し、インライン解析しない', () => {
		const blocks = parseMarkdownDocument('```\nconst a = 1;\n**not bold**\n```');
		expect(blocks).toEqual([{ type: 'code-block', value: 'const a = 1;\n**not bold**' }]);
	});
});

describe('parseInline', () => {
	test('太字(**)を解析する', () => {
		expect(parseInline('これは**重要**です')).toEqual([
			{ type: 'text', value: 'これは' },
			{ type: 'strong', children: [{ type: 'text', value: '重要' }] },
			{ type: 'text', value: 'です' }
		]);
	});

	test('斜体(*)を解析する', () => {
		expect(parseInline('*注記*')).toEqual([
			{ type: 'emphasis', children: [{ type: 'text', value: '注記' }] }
		]);
	});

	test('インラインコードを解析する', () => {
		expect(parseInline('`code`')).toEqual([{ type: 'code', value: 'code' }]);
	});

	test('安全なスキーム(https)のリンクはそのまま解析する', () => {
		expect(parseInline('[利用規約](https://example.com/terms)')).toEqual([
			{
				type: 'link',
				href: 'https://example.com/terms',
				children: [{ type: 'text', value: '利用規約' }]
			}
		]);
	});

	test('サイト内相対パスのリンクを許可する', () => {
		expect(parseInline('[プライバシー](/privacy)')).toEqual([
			{ type: 'link', href: '/privacy', children: [{ type: 'text', value: 'プライバシー' }] }
		]);
	});

	test('危険なスキーム(javascript:)のリンクはリンク化せずテキストのみ残す(XSS対策・AC-CONTENT-002)', () => {
		expect(parseInline('[クリック](javascript:alert(1))')).toEqual([
			{ type: 'text', value: 'クリック' }
		]);
	});

	test('protocol-relative(//)のリンクは許可しない', () => {
		expect(parseInline('[link](//evil.example.com)')).toEqual([{ type: 'text', value: 'link' }]);
	});
});
