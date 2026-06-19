import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';

const meta: Meta<typeof Button> = {
	title: 'UI/Button',
	component: Button,
	args: { children: '保存' },
	argTypes: {
		variant: { control: 'select', options: ['primary', 'outline', 'ghost', 'danger', 'link'] },
		size: { control: 'select', options: ['sm', 'md', 'lg', 'icon'] }
	}
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Outline: Story = { args: { variant: 'outline', children: 'キャンセル' } };

export const Danger: Story = { args: { variant: 'danger', children: '凍結する' } };

export const Disabled: Story = { args: { disabled: true, children: '送信' } };

export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button variant="primary">主要</Button>
			<Button variant="outline">アウトライン</Button>
			<Button variant="ghost">ゴースト</Button>
			<Button variant="danger">危険</Button>
			<Button variant="link">リンク</Button>
		</div>
	)
};
