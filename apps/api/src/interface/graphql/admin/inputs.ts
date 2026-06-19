// 管理者 Mutation/Query の Input・Args 型。class-validator で「形」を境界検証し、
// 業務ルール(しきい値範囲・パスワード長・遷移)はユースケース/ドメインが正本(DRY)。
import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { AdminRole } from '../../../domain/admin-role';
import { ReportStatus, UnfreezeRequestStatus } from '../../../domain/moderation';
import { UserStatus } from '../../../domain/user-status';

@InputType()
export class AdminLoginInput {
	@Field(() => String)
	@IsString()
	@MaxLength(254)
	email!: string;

	@Field(() => String)
	@IsString()
	@MaxLength(512)
	password!: string;
}

@ArgsType()
export class AdminUsersArgs {
	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	search?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsIn([UserStatus.UNVERIFIED, UserStatus.ACTIVE, UserStatus.FROZEN, UserStatus.WITHDRAWN])
	status?: string;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	limit?: number;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	offset?: number;
}

@InputType()
export class AdminCreateAdminInput {
	@Field(() => String)
	@IsString()
	@MaxLength(254)
	email!: string;

	@Field(() => String)
	@IsString()
	@MaxLength(512)
	password!: string;

	@Field(() => String)
	@IsIn([AdminRole.SUPER_ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT, AdminRole.VIEWER])
	role!: string;
}

@InputType()
export class AdminChangeRoleInput {
	@Field(() => String)
	@IsString()
	targetId!: string;

	@Field(() => String)
	@IsIn([AdminRole.SUPER_ADMIN, AdminRole.MODERATOR, AdminRole.SUPPORT, AdminRole.VIEWER])
	role!: string;
}

@InputType()
export class AdminFreezeUserInput {
	@Field(() => String)
	@IsString()
	userId!: string;

	@Field(() => String)
	@IsString()
	@MaxLength(120)
	reasonCategory!: string;
}

@InputType()
export class AdminReviewReportInput {
	@Field(() => String)
	@IsString()
	reportId!: string;

	@Field(() => String)
	@IsIn([ReportStatus.RESOLVED, ReportStatus.DISMISSED])
	decision!: string;
}

@InputType()
export class AdminReviewUnfreezeInput {
	@Field(() => String)
	@IsString()
	requestId!: string;

	@Field(() => Boolean)
	@IsBoolean()
	approve!: boolean;
}

@ArgsType()
export class AdminAuditLogsArgs {
	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsIn(['admin', 'user', 'system'])
	actorType?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	eventType?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	targetId?: string;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	limit?: number;

	@Field(() => Int, { nullable: true })
	@IsOptional()
	@IsInt()
	offset?: number;
}

@ArgsType()
export class AdminReportsArgs {
	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsIn([ReportStatus.OPEN, ReportStatus.IN_REVIEW, ReportStatus.RESOLVED, ReportStatus.DISMISSED])
	status?: string;
}

@ArgsType()
export class AdminUnfreezeRequestsArgs {
	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsIn([
		UnfreezeRequestStatus.PENDING,
		UnfreezeRequestStatus.APPROVED,
		UnfreezeRequestStatus.REJECTED
	])
	status?: string;
}

@InputType()
export class AdminFinishPasskeyRegistrationInput {
	/** 認証器レスポンス(JSON 文字列)。 */
	@Field(() => String)
	@IsString()
	responseJson!: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	@MaxLength(50)
	nickname?: string;
}

@InputType()
export class AdminPasskeyAuthInput {
	@Field(() => String)
	@IsString()
	@MaxLength(254)
	email!: string;

	@Field(() => String)
	@IsString()
	responseJson!: string;
}
