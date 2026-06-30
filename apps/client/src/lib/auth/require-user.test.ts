import { ApiError } from '../api/graphql';

const redirectMock = jest.fn((path: string): never => {
	// next/navigation の redirect は NEXT_REDIRECT 例外で制御フローを抜けるため、例外で模倣する。
	throw new Error(`REDIRECT:${path}`);
});
jest.mock('next/navigation', () => ({
	redirect: (path: string) => redirectMock(path)
}));

const getMeMock = jest.fn();
jest.mock('../api/client', () => ({
	getMe: () => getMeMock()
}));

import { requireUser } from './require-user';

describe('requireUser', () => {
	beforeEach(() => {
		redirectMock.mockClear();
		getMeMock.mockReset();
	});

	test('認証済みなら利用者情報を返す', async () => {
		getMeMock.mockResolvedValue({ id: 'u1', handle: 'taro' });

		await expect(requireUser()).resolves.toEqual({ id: 'u1', handle: 'taro' });
		expect(redirectMock).not.toHaveBeenCalled();
	});

	test('UNAUTHORIZED なら Cookie 回収ルート経由で遷移する(再ログインのロックアウト防止)', async () => {
		// 失効 Cookie が残ったまま /login へ送ると middleware が / へ戻し、ログイン画面に到達できなくなる。
		// Cookie を破棄するルートを挟むことでロックアウトを防ぐ。
		getMeMock.mockRejectedValue(new ApiError('unauthorized', 'UNAUTHORIZED'));

		await expect(requireUser()).rejects.toThrow('REDIRECT:/logout');
		expect(redirectMock).toHaveBeenCalledWith('/logout');
	});

	test('UNAUTHORIZED 以外のエラーはそのまま投げる', async () => {
		getMeMock.mockRejectedValue(new ApiError('boom', 'INTERNAL_ERROR'));

		await expect(requireUser()).rejects.toThrow('boom');
		expect(redirectMock).not.toHaveBeenCalled();
	});
});
