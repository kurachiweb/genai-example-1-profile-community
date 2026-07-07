import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarkdownContent } from './markdown-content';

const meta: Meta<typeof MarkdownContent> = {
	title: 'Content/MarkdownContent',
	component: MarkdownContent
};

export default meta;

type Story = StoryObj<typeof MarkdownContent>;

const SAMPLE = `# 利用規約

本サービスの利用にあたっては、以下の規約に**同意**したものとみなします。

## 第1条(適用範囲)

- 本規約は全ての利用者に適用されます。
- 未成年者の利用については *別途定める* ガイドラインに従います。

> 重要: 規約は予告なく改定される場合があります。

詳細は [お問い合わせ](/inquiries) までご連絡ください。`;

export const 規約サンプル: Story = {
	args: { markdown: SAMPLE }
};
