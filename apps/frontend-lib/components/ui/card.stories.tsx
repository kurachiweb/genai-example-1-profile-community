import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

const meta: Meta<typeof Card> = {
	title: 'UI/Card (Bento タイル)',
	component: Card
};

export default meta;

type Story = StoryObj<typeof Card>;

export const StatTile: Story = {
	render: () => (
		<Card className="w-72">
			<CardHeader>
				<CardDescription>登録ユーザー数</CardDescription>
				<CardTitle as="h2" className="text-[length:var(--text-display)]">
					1,284
				</CardTitle>
			</CardHeader>
			<CardContent className="text-[length:var(--text-meta)] text-text-muted">
				過去 30 日で +112
			</CardContent>
		</Card>
	)
};

export const Elevations: Story = {
	render: () => (
		<div className="flex items-start gap-4">
			<Card elevation={1} className="w-40">
				elevation 1
			</Card>
			<Card elevation={2} className="w-40">
				elevation 2
			</Card>
			<Card elevation={3} className="w-40">
				elevation 3
			</Card>
		</div>
	)
};
