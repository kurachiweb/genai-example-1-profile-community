/** @jest-environment node */
const clearSessionMock = jest.fn();
jest.mock('@/lib/auth/session', () => ({
	clearSession: () => clearSessionMock()
}));

import { GET } from './route';

describe('GET /logout', () => {
	beforeEach(() => {
		clearSessionMock.mockReset();
	});

	test('Cookie を破棄して /login へリダイレクトする', async () => {
		const res = await GET(new Request('http://localhost:48033/logout'));

		expect(clearSessionMock).toHaveBeenCalledTimes(1);
		expect(res.status).toBe(307);
		expect(res.headers.get('location')).toBe('http://localhost:48033/login');
	});
});
