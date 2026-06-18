// 他者を含む公開プロフィールのコントローラ(Interface Adapters / Controller、api/02 §2)。
// 実効公開のみ返し、それ以外は 404 で秘匿する(認可・ゲートはユースケース層が評価、BR-API-005)。
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicProfileService } from '../../application/public-profile.service';
import { ListProfilesQueryDto } from './dto/list-profiles-query';
import { ProfileView } from './dto/profile-view';
import { ApiKeyThrottlerGuard } from './guards/api-key-throttler.guard';
import { ApiKeyAuthGuard } from './guards/api-key.guard';
import { ApiScopeGuard } from './guards/scope.guard';
import { Paginated } from './interceptors/envelope.interceptor';
import { presentProfile } from './presenter';

@ApiTags('profiles')
@ApiBearerAuth()
@Controller('profiles')
@UseGuards(ApiKeyAuthGuard, ApiKeyThrottlerGuard, ApiScopeGuard)
export class ProfilesController {
	constructor(private readonly service: PublicProfileService) {}

	@Get()
	@ApiOperation({ summary: '公開プロフィール一覧(read・カーソルページング、AC-API-006/BR-API-007)。' })
	@ApiOkResponse({ type: ProfileView, isArray: true })
	async listProfiles(@Query() query: ListProfilesQueryDto): Promise<Paginated<ProfileView[]>> {
		const result = await this.service.listPublicProfiles({
			first: query.limit,
			after: query.cursor
		});
		const data = result.items.map(presentProfile);
		// meta は付加情報がある場合のみ埋める(api/02 §3)。
		return new Paginated(data, {
			limit: result.limit,
			nextCursor: result.nextCursor,
			hasMore: result.hasMore
		});
	}

	@Get(':handle')
	@ApiOperation({
		summary: '他ユーザーの公開プロフィール取得(read)。非公開等は 404 で秘匿(AC-API-006/007)。'
	})
	@ApiOkResponse({ type: ProfileView })
	async getProfile(@Param('handle') handle: string): Promise<ProfileView> {
		return presentProfile(await this.service.getPublicProfileByHandle(handle));
	}
}
