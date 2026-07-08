// api(内部 GraphQL)のドメイン例外コード(domain/errors.ts と一致)。
// next/headers に依存しないため、Client Component からも安全に import できる
// (graphql.ts は next/headers に依存するため、エラー型はここへ分離する)。
export class ApiError extends Error {
	constructor(
		message: string,
		readonly code?: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}
