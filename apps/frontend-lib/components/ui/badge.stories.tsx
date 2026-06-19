import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
	title: 'UI/Badge',
	component: Badge,
	args: { children: 'ACTIVE' }
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Tones: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-2">
			<Badge tone="neutral">UNVERIFIED</Badge>
			<Badge tone="success">ACTIVE</Badge>
			<Badge tone="warning">IN_REVIEW</Badge>
			<Badge tone="danger">FROZEN</Badge>
			<Badge tone="info">WITHDRAWN</Badge>
			<Badge tone="accent">super_admin</Badge>
			<Badge tone="outline">read</Badge>
		</div>
	)
};
