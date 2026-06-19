// 管理者 GraphQL 操作の型付きラッパー(BFF サーバー側専用)。クエリは RSC から、ミューテーションは Server Action から呼ぶ。
import { graphqlRequest, RequestOptions } from './graphql';
import {
	AdminAccount,
	AdminMe,
	AdminStats,
	ApiKeyMeta,
	AuditLogConnection,
	Passkey,
	ReportItem,
	UnfreezeRequestItem,
	UserConnection,
	UserSummary
} from './types';

// --- クエリ ---

export async function getMe(options?: RequestOptions): Promise<AdminMe> {
	const data = await graphqlRequest<{ adminMe: AdminMe }>(
		`query{ adminMe{ adminId role } }`,
		{},
		options
	);
	return data.adminMe;
}

export async function getStats(): Promise<AdminStats> {
	const data = await graphqlRequest<{ adminStats: AdminStats }>(
		`query{ adminStats{ totalUsers activeUsers unverifiedUsers frozenUsers withdrawnUsers effectivePublicProfiles openReports pendingUnfreezeRequests activeApiKeys } }`
	);
	return data.adminStats;
}

const USER_FIELDS = `id email handle status visibility displayName reportCount apiKeyCount createdAt`;

export async function listUsers(params: {
	search?: string;
	status?: string;
	limit?: number;
	offset?: number;
}): Promise<UserConnection> {
	const data = await graphqlRequest<{ adminUsers: UserConnection }>(
		`query($search:String,$status:String,$limit:Int,$offset:Int){ adminUsers(search:$search,status:$status,limit:$limit,offset:$offset){ total users{ ${USER_FIELDS} } } }`,
		params
	);
	return data.adminUsers;
}

export async function getUser(id: string): Promise<UserSummary> {
	const data = await graphqlRequest<{ adminUser: UserSummary }>(
		`query($id:String!){ adminUser(id:$id){ ${USER_FIELDS} } }`,
		{ id }
	);
	return data.adminUser;
}

export async function listReports(status?: string): Promise<ReportItem[]> {
	const data = await graphqlRequest<{ adminReports: ReportItem[] }>(
		`query($status:String){ adminReports(status:$status){ id targetUserId targetHandle reasonCategory detail status duplicateCount createdAt updatedAt } }`,
		{ status }
	);
	return data.adminReports;
}

export async function listUnfreezeRequests(status?: string): Promise<UnfreezeRequestItem[]> {
	const data = await graphqlRequest<{ adminUnfreezeRequests: UnfreezeRequestItem[] }>(
		`query($status:String){ adminUnfreezeRequests(status:$status){ id userId reason supplement status reviewedBy createdAt reviewedAt } }`,
		{ status }
	);
	return data.adminUnfreezeRequests;
}

export async function listApiKeys(): Promise<ApiKeyMeta[]> {
	const data = await graphqlRequest<{ adminApiKeys: ApiKeyMeta[] }>(
		`query{ adminApiKeys{ id userId ownerEmail label scope status lastUsedAt createdAt revokedAt } }`
	);
	return data.adminApiKeys;
}

export async function getRateLimit(): Promise<number> {
	const data = await graphqlRequest<{ adminApiRateLimit: number }>(`query{ adminApiRateLimit }`);
	return data.adminApiRateLimit;
}

export async function listAuditLogs(params: {
	actorType?: string;
	eventType?: string;
	targetId?: string;
	limit?: number;
	offset?: number;
}): Promise<AuditLogConnection> {
	const data = await graphqlRequest<{ adminAuditLogs: AuditLogConnection }>(
		`query($actorType:String,$eventType:String,$targetId:String,$limit:Int,$offset:Int){ adminAuditLogs(actorType:$actorType,eventType:$eventType,targetId:$targetId,limit:$limit,offset:$offset){ total logs{ id eventType actorType actorId targetType targetId result metadataJson occurredAt } } }`,
		params
	);
	return data.adminAuditLogs;
}

export async function listAdmins(): Promise<AdminAccount[]> {
	const data = await graphqlRequest<{ adminAccounts: AdminAccount[] }>(
		`query{ adminAccounts{ id email role status passkeyCount createdAt updatedAt } }`
	);
	return data.adminAccounts;
}

export async function listPasskeys(): Promise<Passkey[]> {
	const data = await graphqlRequest<{ adminPasskeys: Passkey[] }>(
		`query{ adminPasskeys{ id nickname createdAt lastUsedAt } }`
	);
	return data.adminPasskeys;
}

// --- WebAuthn(パスキー)。オプション/レスポンスは JSON 文字列で授受する ---

export async function startPasskeyRegistration(): Promise<Record<string, unknown>> {
	const data = await graphqlRequest<{ adminStartPasskeyRegistration: string }>(
		`mutation{ adminStartPasskeyRegistration }`
	);
	return JSON.parse(data.adminStartPasskeyRegistration) as Record<string, unknown>;
}

export async function finishPasskeyRegistration(
	responseJson: string,
	nickname?: string
): Promise<void> {
	await graphqlRequest(
		`mutation($input:AdminFinishPasskeyRegistrationInput!){ adminFinishPasskeyRegistration(input:$input){ id } }`,
		{ input: { responseJson, nickname } }
	);
}

export async function startPasskeyAuthentication(email: string): Promise<Record<string, unknown>> {
	const data = await graphqlRequest<{ adminStartPasskeyAuthentication: string }>(
		`mutation($email:String!){ adminStartPasskeyAuthentication(email:$email) }`,
		{ email },
		{ sessionId: null }
	);
	return JSON.parse(data.adminStartPasskeyAuthentication) as Record<string, unknown>;
}

export async function finishPasskeyAuthentication(
	email: string,
	responseJson: string
): Promise<{ sessionId: string; csrfToken: string; role: string }> {
	const data = await graphqlRequest<{
		adminFinishPasskeyAuthentication: { sessionId: string; csrfToken: string; role: string };
	}>(
		`mutation($input:AdminPasskeyAuthInput!){ adminFinishPasskeyAuthentication(input:$input){ sessionId csrfToken role } }`,
		{ input: { email, responseJson } },
		{ sessionId: null }
	);
	return data.adminFinishPasskeyAuthentication;
}

export async function deletePasskey(id: string): Promise<void> {
	await graphqlRequest(`mutation($id:String!){ adminDeletePasskey(id:$id) }`, { id });
}

// --- ミューテーション ---

export async function freezeUser(userId: string, reasonCategory: string): Promise<void> {
	await graphqlRequest(
		`mutation($input:AdminFreezeUserInput!){ adminFreezeUser(input:$input){ id status } }`,
		{ input: { userId, reasonCategory } }
	);
}

export async function deleteIcon(userId: string): Promise<void> {
	await graphqlRequest(`mutation($userId:String!){ adminDeleteIcon(userId:$userId){ id } }`, {
		userId
	});
}

export async function reviewReport(reportId: string, decision: string): Promise<void> {
	await graphqlRequest(
		`mutation($input:AdminReviewReportInput!){ adminReviewReport(input:$input) }`,
		{ input: { reportId, decision } }
	);
}

export async function reviewUnfreeze(requestId: string, approve: boolean): Promise<void> {
	await graphqlRequest(
		`mutation($input:AdminReviewUnfreezeInput!){ adminReviewUnfreezeRequest(input:$input) }`,
		{ input: { requestId, approve } }
	);
}

export async function revokeApiKey(keyId: string): Promise<void> {
	await graphqlRequest(`mutation($keyId:String!){ adminRevokeApiKey(keyId:$keyId) }`, { keyId });
}

export async function setRateLimit(value: number): Promise<number> {
	const data = await graphqlRequest<{ adminSetApiRateLimit: number }>(
		`mutation($value:Int!){ adminSetApiRateLimit(value:$value) }`,
		{ value }
	);
	return data.adminSetApiRateLimit;
}

export async function createAdmin(input: {
	email: string;
	password: string;
	role: string;
}): Promise<void> {
	await graphqlRequest(
		`mutation($input:AdminCreateAdminInput!){ adminCreateAdmin(input:$input){ id } }`,
		{ input }
	);
}

export async function changeRole(targetId: string, role: string): Promise<void> {
	await graphqlRequest(
		`mutation($input:AdminChangeRoleInput!){ adminChangeRole(input:$input){ id role } }`,
		{ input: { targetId, role } }
	);
}

export async function disableAdmin(targetId: string): Promise<void> {
	await graphqlRequest(
		`mutation($targetId:String!){ adminDisableAdmin(targetId:$targetId){ id } }`,
		{
			targetId
		}
	);
}
