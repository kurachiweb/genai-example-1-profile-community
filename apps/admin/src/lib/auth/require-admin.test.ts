import { ApiError } from '../api/graphql';

const redirectMock = jest.fn((path: string): never => {
	// next/navigation の redirect は NEXT_REDIRECT 例外で制御フローを抜けるため、例外で模倣する。
	throw new Error(`REDIRECT:${path}`);
});
jest.mock('next/navigation', () => ({
	redirect: (path: string) => redirectMock(path)
}));

const getMeMock = jest.fn();
jest.mock('../api/admin', () => ({
	getMe: () => getMeMock()
}));

import { requireAdmin } from './require-admin';

describe('requireAdmin', () => {
	beforeEach(() => {
		redirectMock.mockClear();
		getMeMock.mockReset();
	});

	test('認証済みなら管理者情報を返す', async () => {
		getMeMock.mockResolvedValue({ adminId: 'a1', role: 'super_admin' });

		await expect(requireAdmin()).resolves.toEqual({ adminId: 'a1', role: 'super_admin' });
		expect(redirectMock).not.toHaveBeenCalled();
	});

	test('UNAUTHORIZED なら Cookie 回収ルート経由で遷移する(ERR_TOO_MANY_REDIRECTS 防止)', async () => {
		// 失効 Cookie が残ったまま /login へ送ると proxy が / へ戻し無限ループになる。
		// Cookie を破棄するルートを挟むことでループを断ち切る。
		getMeMock.mockRejectedValue(new ApiError('unauthorized', 'UNAUTHORIZED'));

		await expect(requireAdmin()).rejects.toThrow('REDIRECT:/logout');
		expect(redirectMock).toHaveBeenCalledWith('/logout');
	});

	test('UNAUTHORIZED 以外のエラーはそのまま投げる', async () => {
		getMeMock.mockRejectedValue(new ApiError('boom', 'INTERNAL_ERROR'));

		await expect(requireAdmin()).rejects.toThrow('boom');
		expect(redirectMock).not.toHaveBeenCalled();
	});
});
