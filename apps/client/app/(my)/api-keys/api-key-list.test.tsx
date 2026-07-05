import { render, screen } from '@testing-library/react';
import { ApiKeyList } from './api-key-list';
import type { ApiKey } from '@/lib/api/types';

jest.mock('@/lib/actions', () => ({
	revokeApiKeyAction: jest.fn()
}));

const makeApiKey = (overrides: Partial<ApiKey> = {}): ApiKey => ({
	id: 'key-1',
	label: 'CI 用キー',
	scope: 'read',
	status: 'active',
	lastUsedAt: null,
	createdAt: '2026-07-01T00:00:00.000Z',
	...overrides
});

describe('ApiKeyList', () => {
	// サーバー(myApiKeys)の実返却値は小文字 'active'。大文字と比較すると常に除外され0件表示になる回帰を防ぐ。
	it('サーバーが返す有効(active)なキーを一覧表示する', () => {
		render(<ApiKeyList keys={[makeApiKey({ id: 'key-1', label: 'CI 用キー' })]} />);
		expect(screen.getByText('CI 用キー')).toBeInTheDocument();
		expect(screen.queryByText('有効な API キーがありません。')).not.toBeInTheDocument();
	});

	it('有効なキーが1件もないときは空状態を表示する', () => {
		render(<ApiKeyList keys={[]} />);
		expect(screen.getByText('有効な API キーがありません。')).toBeInTheDocument();
	});
});
