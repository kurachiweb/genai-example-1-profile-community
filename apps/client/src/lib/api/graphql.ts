// 内部 GraphQL(api)へのサーバー側リクエスト(BFF)。Cookie のセッション ID を x-user-session で転送する。
// ブラウザには api を直接公開せず、Cookie はサーバー側だけが読む(security/01 §1)。
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '../auth/constants';
import { ApiError } from './errors';

const API_GRAPHQL_URL = process.env.API_GRAPHQL_URL ?? 'http://localhost:48031/graphql';

// Client Component からも参照されるため、既存の import 元(@/lib/api/graphql)との後方互換として
// 再エクスポートする(型自体の定義は next/headers に依存しない ./errors 側が正本)。
export { ApiError };

interface GraphQLResponse<T> {
	data?: T;
	errors?: { message: string; extensions?: { code?: string } }[];
}

export interface RequestOptions {
	/** 明示セッション(ログイン直後など、Cookie 未設定時に使う)。 */
	readonly sessionId?: string | null;
}

export async function graphqlRequest<T>(
	query: string,
	variables: Record<string, unknown> = {},
	options: RequestOptions = {}
): Promise<T> {
	const sessionId =
		options.sessionId !== undefined
			? options.sessionId
			: ((await cookies()).get(SESSION_COOKIE)?.value ?? null);

	const response = await fetch(API_GRAPHQL_URL, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			...(sessionId ? { 'x-user-session': sessionId } : {})
		},
		body: JSON.stringify({ query, variables }),
		// 利用者データは常に最新を取得する(キャッシュしない)。
		cache: 'no-store'
	});

	const json = (await response.json()) as GraphQLResponse<T>;
	if (json.errors && json.errors.length > 0) {
		const first = json.errors[0];
		throw new ApiError(first.message, first.extensions?.code);
	}
	if (!json.data) {
		throw new ApiError('内部 API から空の応答が返りました。', 'INTERNAL_ERROR');
	}
	return json.data;
}
