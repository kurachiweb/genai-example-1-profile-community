const redirectMock = jest.fn((path: string): never => {
	// next/navigation の redirect は NEXT_REDIRECT 例外で制御フローを抜けるため、例外で模倣する。
	throw new Error(`REDIRECT:${path}`);
});
jest.mock('next/navigation', () => ({
	redirect: (path: string) => redirectMock(path)
}));

const getSessionIdMock = jest.fn();
jest.mock('./session', () => ({
	getSessionId: () => getSessionIdMock()
}));

import { redirectIfAuthenticated, requireSessionCookie } from './route-guards';

describe('route-guards(旧 proxy.ts の UX 補助ガード)', () => {
	beforeEach(() => {
		redirectMock.mockClear();
		getSessionIdMock.mockReset();
	});

	describe('requireSessionCookie', () => {
		test('セッション Cookie が無ければ /login へリダイレクトする', async () => {
			getSessionIdMock.mockResolvedValue(undefined);

			await expect(requireSessionCookie()).rejects.toThrow('REDIRECT:/login');
			expect(redirectMock).toHaveBeenCalledWith('/login');
		});

		test('セッション Cookie があればリダイレクトしない', async () => {
			getSessionIdMock.mockResolvedValue('session-id');

			await expect(requireSessionCookie()).resolves.toBeUndefined();
			expect(redirectMock).not.toHaveBeenCalled();
		});
	});

	describe('redirectIfAuthenticated', () => {
		test('セッション Cookie があれば / へリダイレクトする', async () => {
			getSessionIdMock.mockResolvedValue('session-id');

			await expect(redirectIfAuthenticated()).rejects.toThrow('REDIRECT:/');
			expect(redirectMock).toHaveBeenCalledWith('/');
		});

		test('セッション Cookie が無ければリダイレクトしない', async () => {
			getSessionIdMock.mockResolvedValue(undefined);

			await expect(redirectIfAuthenticated()).resolves.toBeUndefined();
			expect(redirectMock).not.toHaveBeenCalled();
		});
	});
});
