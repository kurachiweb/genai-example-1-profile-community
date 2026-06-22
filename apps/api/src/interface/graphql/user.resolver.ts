// 利用者アカウントの GraphQL リゾルバ(Interface Adapters / Controller)。
// 認証(register/login/logout)・アカウント管理(me/changePassword/withdraw)・API キー管理を担う。
import { Inject } from '@nestjs/common';
import {
	Args,
	Context,
	Field,
	GraphQLISODateTime,
	InputType,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver
} from '@nestjs/graphql';
import { IsEmail, IsString, MaxLength } from 'class-validator';
import { UnauthorizedError } from '../../domain/errors';
import { UserService } from '../../application/user.service';
import {
	USER_SESSION_STORE,
	type UserSessionStore
} from '../../infrastructure/user-session.store';
import { ViewerProvider, type RequestLike } from './viewer.provider';

interface GraphQLContext {
	readonly req?: RequestLike;
}

// --- 出力型 ---

@ObjectType('UserLoginResult')
class UserLoginResultType {
	@Field(() => String)
	sessionId!: string;
}

@ObjectType('MeType')
class MeType {
	@Field(() => String)
	userId!: string;

	@Field(() => String)
	email!: string;

	@Field(() => String)
	status!: string;

	@Field(() => GraphQLISODateTime, { nullable: true })
	emailVerifiedAt!: Date | null;
}

@ObjectType('ApiKeyType')
class ApiKeyType {
	@Field(() => String)
	id!: string;

	@Field(() => String, { nullable: true })
	label!: string | null;

	@Field(() => String)
	scope!: string;

	@Field(() => String)
	status!: string;

	@Field(() => GraphQLISODateTime, { nullable: true })
	lastUsedAt!: Date | null;

	@Field(() => GraphQLISODateTime)
	createdAt!: Date;
}

@ObjectType('CreatedApiKeyType')
class CreatedApiKeyType {
	@Field(() => String)
	id!: string;

	@Field(() => String, { nullable: true })
	label!: string | null;

	@Field(() => String)
	scope!: string;

	@Field(() => String)
	status!: string;

	@Field(() => GraphQLISODateTime, { nullable: true })
	lastUsedAt!: Date | null;

	@Field(() => GraphQLISODateTime)
	createdAt!: Date;

	@Field(() => String)
	rawKey!: string;
}

// --- 入力型 ---

@InputType()
class UserRegisterInput {
	@Field(() => String)
	@IsEmail()
	@MaxLength(254)
	email!: string;

	@Field(() => String)
	@IsString()
	@MaxLength(128)
	password!: string;
}

@InputType()
class UserLoginInput {
	@Field(() => String)
	@IsEmail()
	email!: string;

	@Field(() => String)
	@IsString()
	password!: string;
}

@InputType()
class UserChangePasswordInput {
	@Field(() => String)
	@IsString()
	currentPassword!: string;

	@Field(() => String)
	@IsString()
	@MaxLength(128)
	newPassword!: string;
}

@InputType()
class UserChangeEmailInput {
	@Field(() => String)
	@IsEmail()
	@MaxLength(254)
	newEmail!: string;

	@Field(() => String)
	@IsString()
	password!: string;
}

@InputType()
class UserResetPasswordInput {
	@Field(() => String)
	@IsString()
	token!: string;

	@Field(() => String)
	@IsString()
	@MaxLength(128)
	newPassword!: string;
}

@InputType()
class UserCreateApiKeyInput {
	@Field(() => String)
	@IsString()
	@MaxLength(50)
	label!: string;

	@Field(() => String)
	@IsString()
	scope!: string;
}

// ダミー: Int が未使用の場合の linter 警告を抑制する。
void Int;

// --- リゾルバ ---

@Resolver()
export class UserResolver {
	constructor(
		private readonly userService: UserService,
		private readonly viewerProvider: ViewerProvider,
		@Inject(USER_SESSION_STORE) private readonly sessions: UserSessionStore
	) {}

	// --- 認証(主体不要) ---

	@Mutation(() => Boolean, { name: 'register' })
	async register(@Args('input') input: UserRegisterInput): Promise<boolean> {
		await this.userService.register(input.email, input.password);
		return true;
	}

	@Mutation(() => UserLoginResultType, { name: 'login' })
	async login(@Args('input') input: UserLoginInput): Promise<UserLoginResultType> {
		const session = await this.userService.login(input.email, input.password);
		return { sessionId: session.sessionId };
	}

	@Mutation(() => Boolean, { name: 'logout' })
	async logout(@Context() ctx: GraphQLContext): Promise<boolean> {
		const sessionId = ctx.req?.headers?.['x-user-session'];
		const sid = Array.isArray(sessionId) ? sessionId[0] : sessionId;
		if (sid) {
			await this.sessions.destroy(sid);
		}
		return true;
	}

	@Mutation(() => Boolean, { name: 'verifyEmail' })
	async verifyEmail(
		@Args('token', { type: () => String }) token: string
	): Promise<boolean> {
		await this.userService.verifyEmail(token);
		return true;
	}

	@Mutation(() => Boolean, { name: 'requestPasswordReset' })
	async requestPasswordReset(
		@Args('email', { type: () => String }) email: string
	): Promise<boolean> {
		await this.userService.requestPasswordReset(email);
		return true;
	}

	@Mutation(() => Boolean, { name: 'resetPassword' })
	async resetPassword(@Args('input') input: UserResetPasswordInput): Promise<boolean> {
		await this.userService.resetPassword(input.token, input.newPassword);
		return true;
	}

	@Mutation(() => Boolean, { name: 'resendVerificationEmail' })
	async resendVerificationEmail(@Context() ctx: GraphQLContext): Promise<boolean> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		if (!viewer) throw new UnauthorizedError();
		await this.userService.resendVerificationEmail(viewer.userId);
		return true;
	}

	// --- 自分のアカウント ---

	@Query(() => MeType, { name: 'me' })
	async me(@Context() ctx: GraphQLContext): Promise<MeType> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		if (!viewer) throw new UnauthorizedError();
		const user = await this.userService.getMe(viewer.userId);
		return {
			userId: user.id,
			email: user.email,
			status: user.status,
			emailVerifiedAt: user.emailVerifiedAt
		};
	}

	@Mutation(() => Boolean, { name: 'changePassword' })
	async changePassword(
		@Args('input') input: UserChangePasswordInput,
		@Context() ctx: GraphQLContext
	): Promise<boolean> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		if (!viewer) throw new UnauthorizedError();
		await this.userService.changePassword(viewer.userId, input.currentPassword, input.newPassword);
		return true;
	}

	@Mutation(() => Boolean, { name: 'requestEmailChange' })
	async requestEmailChange(
		@Args('input') input: UserChangeEmailInput,
		@Context() ctx: GraphQLContext
	): Promise<boolean> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		if (!viewer) throw new UnauthorizedError();
		await this.userService.requestEmailChange(viewer.userId, input.newEmail, input.password);
		return true;
	}

	@Mutation(() => Boolean, { name: 'withdraw' })
	async withdraw(
		@Args('password', { type: () => String }) password: string,
		@Context() ctx: GraphQLContext
	): Promise<boolean> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		if (!viewer) throw new UnauthorizedError();
		await this.userService.withdraw(viewer.userId, password);
		return true;
	}

	// --- API キー ---

	@Query(() => [ApiKeyType], { name: 'myApiKeys' })
	async myApiKeys(@Context() ctx: GraphQLContext): Promise<ApiKeyType[]> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		if (!viewer) throw new UnauthorizedError();
		const keys = await this.userService.listApiKeys(viewer.userId);
		return keys.map((k) => ({
			id: k.id,
			label: k.label,
			scope: k.scope,
			status: k.status,
			lastUsedAt: k.lastUsedAt,
			createdAt: k.createdAt
		}));
	}

	@Mutation(() => CreatedApiKeyType, { name: 'createApiKey' })
	async createApiKey(
		@Args('input') input: UserCreateApiKeyInput,
		@Context() ctx: GraphQLContext
	): Promise<CreatedApiKeyType> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		if (!viewer) throw new UnauthorizedError();
		const key = await this.userService.createApiKey(
			viewer.userId,
			input.label,
			input.scope as 'read' | 'full'
		);
		return {
			id: key.id,
			label: key.label,
			scope: key.scope,
			status: key.status,
			lastUsedAt: key.lastUsedAt,
			createdAt: key.createdAt,
			rawKey: key.rawKey
		};
	}

	@Mutation(() => Boolean, { name: 'revokeApiKey' })
	async revokeApiKey(
		@Args('id', { type: () => String }) id: string,
		@Context() ctx: GraphQLContext
	): Promise<boolean> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		if (!viewer) throw new UnauthorizedError();
		await this.userService.revokeApiKey(viewer.userId, id);
		return true;
	}
}
