// 管理者 GraphQL 出力型(Interface Adapters / ViewModel)。
// WebAuthn のオプション/レスポンスは任意 JSON のため、依存を増やさず JSON 文字列(String)で授受する。
import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('AdminMe')
export class AdminMeType {
	@Field(() => String)
	adminId!: string;

	@Field(() => String)
	role!: string;
}

@ObjectType('AdminLoginResult')
export class AdminLoginResultType {
	// セッション ID・CSRF トークンは admin BFF(Next.js サーバー)が消費し、ブラウザには露出しない。
	@Field(() => String)
	sessionId!: string;

	@Field(() => String)
	csrfToken!: string;

	@Field(() => String)
	adminId!: string;

	@Field(() => String)
	role!: string;
}

@ObjectType('AdminAccount')
export class AdminAccountType {
	@Field(() => String)
	id!: string;

	@Field(() => String)
	email!: string;

	@Field(() => String)
	role!: string;

	@Field(() => String)
	status!: string;

	@Field(() => Int)
	passkeyCount!: number;

	@Field(() => GraphQLISODateTime)
	createdAt!: Date;

	@Field(() => GraphQLISODateTime)
	updatedAt!: Date;
}

@ObjectType('AdminUserSummary')
export class UserSummaryType {
	@Field(() => String)
	id!: string;

	@Field(() => String)
	email!: string;

	@Field(() => String, { nullable: true })
	handle!: string | null;

	@Field(() => String)
	status!: string;

	@Field(() => String, { nullable: true })
	visibility!: string | null;

	@Field(() => String, { nullable: true })
	displayName!: string | null;

	@Field(() => Int)
	reportCount!: number;

	@Field(() => Int)
	apiKeyCount!: number;

	@Field(() => GraphQLISODateTime)
	createdAt!: Date;
}

@ObjectType('AdminUserConnection')
export class UserConnectionType {
	@Field(() => [UserSummaryType])
	users!: UserSummaryType[];

	@Field(() => Int)
	total!: number;
}

@ObjectType('AdminApiKeyMeta')
export class ApiKeyMetaType {
	@Field(() => String)
	id!: string;

	@Field(() => String)
	userId!: string;

	@Field(() => String, { nullable: true })
	ownerEmail!: string | null;

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

	@Field(() => GraphQLISODateTime, { nullable: true })
	revokedAt!: Date | null;
}

@ObjectType('AdminReport')
export class ReportType {
	@Field(() => String)
	id!: string;

	@Field(() => String, { nullable: true })
	targetUserId!: string | null;

	@Field(() => String)
	targetHandle!: string;

	@Field(() => String)
	reasonCategory!: string;

	@Field(() => String, { nullable: true })
	detail!: string | null;

	@Field(() => String)
	status!: string;

	@Field(() => Int)
	duplicateCount!: number;

	@Field(() => GraphQLISODateTime)
	createdAt!: Date;

	@Field(() => GraphQLISODateTime)
	updatedAt!: Date;
}

@ObjectType('AdminUnfreezeRequest')
export class UnfreezeRequestType {
	@Field(() => String)
	id!: string;

	@Field(() => String)
	userId!: string;

	@Field(() => String)
	reason!: string;

	@Field(() => String, { nullable: true })
	supplement!: string | null;

	@Field(() => String)
	status!: string;

	@Field(() => String, { nullable: true })
	reviewedBy!: string | null;

	@Field(() => GraphQLISODateTime)
	createdAt!: Date;

	@Field(() => GraphQLISODateTime, { nullable: true })
	reviewedAt!: Date | null;
}

@ObjectType('AdminAuditLog')
export class AuditLogType {
	@Field(() => String)
	id!: string;

	@Field(() => String)
	eventType!: string;

	@Field(() => String)
	actorType!: string;

	@Field(() => String, { nullable: true })
	actorId!: string | null;

	@Field(() => String, { nullable: true })
	targetType!: string | null;

	@Field(() => String, { nullable: true })
	targetId!: string | null;

	@Field(() => String)
	result!: string;

	/** 旧新差分などのメタ(JSON 文字列)。秘匿値は含めない(BR-COMMON-014)。 */
	@Field(() => String, { nullable: true })
	metadataJson!: string | null;

	@Field(() => GraphQLISODateTime)
	occurredAt!: Date;
}

@ObjectType('AdminAuditLogConnection')
export class AuditLogConnectionType {
	@Field(() => [AuditLogType])
	logs!: AuditLogType[];

	@Field(() => Int)
	total!: number;
}

@ObjectType('AdminStats')
export class AdminStatsType {
	@Field(() => Int)
	totalUsers!: number;

	@Field(() => Int)
	activeUsers!: number;

	@Field(() => Int)
	unverifiedUsers!: number;

	@Field(() => Int)
	frozenUsers!: number;

	@Field(() => Int)
	withdrawnUsers!: number;

	@Field(() => Int)
	effectivePublicProfiles!: number;

	@Field(() => Int)
	openReports!: number;

	@Field(() => Int)
	pendingUnfreezeRequests!: number;

	@Field(() => Int)
	activeApiKeys!: number;
}

@ObjectType('AdminPasskey')
export class PasskeyType {
	@Field(() => String)
	id!: string;

	@Field(() => String, { nullable: true })
	nickname!: string | null;

	@Field(() => GraphQLISODateTime)
	createdAt!: Date;

	@Field(() => GraphQLISODateTime, { nullable: true })
	lastUsedAt!: Date | null;
}
