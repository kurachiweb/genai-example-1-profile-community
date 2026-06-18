// 本人プロフィールのコントローラ(Interface Adapters / Controller、api/02 §2)。
// 薄く保ち、入出力変換とユースケース呼び出しに徹する。認可・ゲートはガード/ユースケースが担う。
// エンドポイント仕様の正本は features/05-public-api.md §3。
import { Body, Controller, Delete, Get, Patch, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiKeyScope } from '../../domain/api-key';
import { PublicProfileService } from '../../application/public-profile.service';
// ApiPrincipal はインターフェース。デコレータ付き引数の型は import type が必須(isolatedModules + emitDecoratorMetadata)。
import type { ApiPrincipal } from '../../application/models';
import { Principal, RequireScope } from './decorators/principal.decorator';
import { ProfileView } from './dto/profile-view';
import { PatchProfileDto, PutProfileDto } from './dto/profile-input';
import { ApiKeyThrottlerGuard } from './guards/api-key-throttler.guard';
import { ApiKeyAuthGuard } from './guards/api-key.guard';
import { ApiScopeGuard } from './guards/scope.guard';
import { presentProfile } from './presenter';

@ApiTags('me')
@ApiBearerAuth()
@Controller('me/profile')
// 認証 → レート制限(キー単位)→ スコープ の順で適用する(coding/04-nestjs.md §4.1)。
@UseGuards(ApiKeyAuthGuard, ApiKeyThrottlerGuard, ApiScopeGuard)
export class MeProfileController {
	constructor(private readonly service: PublicProfileService) {}

	@Get()
	@ApiOperation({ summary: '自分のプロフィール取得(read)。非公開でも本人は取得可(AC-API-005)。' })
	@ApiOkResponse({ type: ProfileView })
	async getMyProfile(@Principal() principal: ApiPrincipal): Promise<ProfileView> {
		return presentProfile(await this.service.getMyProfile(principal));
	}

	@Put()
	@RequireScope(ApiKeyScope.FULL)
	@ApiOperation({ summary: '自分のプロフィール全体置換(full)。省略項目は初期化(AC-API-009/010)。' })
	@ApiOkResponse({ type: ProfileView })
	async putMyProfile(
		@Principal() principal: ApiPrincipal,
		@Body() body: PutProfileDto
	): Promise<ProfileView> {
		return presentProfile(await this.service.replaceMyProfile(principal, body));
	}

	@Patch()
	@RequireScope(ApiKeyScope.FULL)
	@ApiOperation({ summary: '自分のプロフィール部分更新(full)。送った項目のみ更新(AC-API-008)。' })
	@ApiOkResponse({ type: ProfileView })
	async patchMyProfile(
		@Principal() principal: ApiPrincipal,
		@Body() body: PatchProfileDto
	): Promise<ProfileView> {
		return presentProfile(await this.service.patchMyProfile(principal, body));
	}

	@Delete()
	@RequireScope(ApiKeyScope.FULL)
	@ApiOperation({
		summary: '自分のプロフィール内容消去＋非公開化(full)。アカウントは存続(AC-API-010)。'
	})
	@ApiOkResponse({ type: ProfileView })
	async deleteMyProfile(@Principal() principal: ApiPrincipal): Promise<ProfileView> {
		return presentProfile(await this.service.deleteMyProfile(principal));
	}
}
