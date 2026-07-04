// 利用者向け GraphQL 操作の型付きラッパー(BFF サーバー側専用)。
// クエリは RSC から、ミューテーションは Server Action から呼ぶ。
import { graphqlRequest, type RequestOptions } from './graphql';
import type {
	ApiKey,
	CreatedApiKey,
	Me,
	MyProfile,
	PublicProfile,
	PublicProfileConnection
} from './types';

// --- 認証 ---

export interface RegisterInput {
	email: string;
	password: string;
}

export interface LoginResult {
	sessionId: string;
}

export async function register(input: RegisterInput): Promise<void> {
	await graphqlRequest(
		`mutation($input:UserRegisterInput!){ register(input:$input) }`,
		{ input },
		{ sessionId: null }
	);
}

export async function login(email: string, password: string): Promise<LoginResult> {
	const data = await graphqlRequest<{ login: LoginResult }>(
		`mutation($input:UserLoginInput!){ login(input:$input){ sessionId } }`,
		{ input: { email, password } },
		{ sessionId: null }
	);
	return data.login;
}

export async function logout(options?: RequestOptions): Promise<void> {
	await graphqlRequest(`mutation{ logout }`, {}, options);
}

export async function verifyEmail(token: string): Promise<void> {
	await graphqlRequest(
		`mutation($token:String!){ verifyEmail(token:$token) }`,
		{ token },
		{ sessionId: null }
	);
}

export async function requestPasswordReset(email: string): Promise<void> {
	await graphqlRequest(
		`mutation($email:String!){ requestPasswordReset(email:$email) }`,
		{ email },
		{ sessionId: null }
	);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
	await graphqlRequest(
		`mutation($input:UserResetPasswordInput!){ resetPassword(input:$input) }`,
		{ input: { token, newPassword } },
		{ sessionId: null }
	);
}

export async function resendVerificationEmail(): Promise<void> {
	await graphqlRequest(`mutation{ resendVerificationEmail }`);
}

// --- 自分のアカウント ---

export async function getMe(options?: RequestOptions): Promise<Me> {
	const data = await graphqlRequest<{ me: Me }>(
		`query{ me{ userId email status emailVerifiedAt } }`,
		{},
		options
	);
	return data.me;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
	await graphqlRequest(
		`mutation($input:UserChangePasswordInput!){ changePassword(input:$input) }`,
		{
			input: { currentPassword, newPassword }
		}
	);
}

export async function requestEmailChange(newEmail: string, password: string): Promise<void> {
	await graphqlRequest(
		`mutation($input:UserChangeEmailInput!){ requestEmailChange(input:$input) }`,
		{
			input: { newEmail, password }
		}
	);
}

export async function withdrawAccount(password: string): Promise<void> {
	await graphqlRequest(`mutation($password:String!){ withdraw(password:$password) }`, { password });
}

// --- プロフィール ---

const SNS_FIELDS = `id platform url displayOrder`;
const PROFILE_FIELDS = `userId handle visibility firstName lastName occupation bio iconUrl snsLinks{ ${SNS_FIELDS} } updatedAt`;

export async function getMyProfile(): Promise<MyProfile> {
	const data = await graphqlRequest<{ myProfile: MyProfile }>(
		`query{ myProfile{ ${PROFILE_FIELDS} } }`
	);
	return data.myProfile;
}

export interface UpdateProfileInput {
	handle?: string;
	visibility?: string;
	firstName?: string;
	lastName?: string;
	occupation?: string;
	bio?: string;
}

export async function updateProfile(input: UpdateProfileInput): Promise<MyProfile> {
	const data = await graphqlRequest<{ updateProfile: MyProfile }>(
		`mutation($input:UpdateProfileInput!){ updateProfile(input:$input){ ${PROFILE_FIELDS} } }`,
		{ input }
	);
	return data.updateProfile;
}

export interface SnsLinkInput {
	platform: string;
	url: string;
	displayOrder: number;
}

export async function setSnsLinks(links: SnsLinkInput[]): Promise<MyProfile> {
	const data = await graphqlRequest<{ setSnsLinks: MyProfile }>(
		`mutation($links:[ClientSnsLinkInput!]!){ setSnsLinks(links:$links){ ${PROFILE_FIELDS} } }`,
		{ links }
	);
	return data.setSnsLinks;
}

export async function setProfileVisibility(visibility: string): Promise<MyProfile> {
	const data = await graphqlRequest<{ setProfileVisibility: MyProfile }>(
		`mutation($visibility:String!){ setProfileVisibility(visibility:$visibility){ ${PROFILE_FIELDS} } }`,
		{ visibility }
	);
	return data.setProfileVisibility;
}

// --- 公開プロフィール ---

const PUBLIC_PROFILE_FIELDS = `handle firstName lastName occupation bio iconUrl snsLinks{ ${SNS_FIELDS} }`;

export async function getPublicProfile(handle: string): Promise<PublicProfile | null> {
	const data = await graphqlRequest<{ publicProfile: PublicProfile | null }>(
		`query($handle:String!){ publicProfile(handle:$handle){ ${PUBLIC_PROFILE_FIELDS} } }`,
		{ handle }
	);
	return data.publicProfile;
}

export async function listPublicProfiles(params: {
	search?: string;
	limit?: number;
	offset?: number;
}): Promise<PublicProfileConnection> {
	const data = await graphqlRequest<{ publicProfiles: PublicProfileConnection }>(
		`query($search:String,$limit:Int,$offset:Int){ publicProfiles(search:$search,limit:$limit,offset:$offset){ total profiles{ handle firstName lastName occupation bio iconUrl } } }`,
		params
	);
	return data.publicProfiles;
}

// --- 通報 ---

export async function reportProfile(
	handle: string,
	reasonCategory: string,
	detail?: string
): Promise<void> {
	await graphqlRequest(`mutation($input:ReportProfileInput!){ reportProfile(input:$input) }`, {
		input: { handle, reasonCategory, detail }
	});
}

// --- API キー ---

const API_KEY_FIELDS = `id label scope status lastUsedAt createdAt`;

export async function listMyApiKeys(): Promise<ApiKey[]> {
	const data = await graphqlRequest<{ myApiKeys: ApiKey[] }>(
		`query{ myApiKeys{ ${API_KEY_FIELDS} } }`
	);
	return data.myApiKeys;
}

export async function createApiKey(label: string, scope: string): Promise<CreatedApiKey> {
	const data = await graphqlRequest<{ createApiKey: CreatedApiKey }>(
		`mutation($input:UserCreateApiKeyInput!){ createApiKey(input:$input){ ${API_KEY_FIELDS} rawKey } }`,
		{ input: { label, scope } }
	);
	return data.createApiKey;
}

export async function revokeApiKey(keyId: string): Promise<void> {
	await graphqlRequest(`mutation($id:String!){ revokeApiKey(id:$id) }`, { id: keyId });
}
