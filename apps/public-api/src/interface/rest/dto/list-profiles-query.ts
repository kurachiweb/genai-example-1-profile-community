// GET /profiles のクエリ DTO(カーソルページング、BR-API-007)。
// limit の既定/最大はユースケース層で確定する(本 DTO は構造のみ。値の正本は BR-API-007)。
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListProfilesQueryDto {
	@ApiPropertyOptional({
		description: '取得件数(既定/最大は BR-API-007)。範囲外はサーバーで丸める。'
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number;

	@ApiPropertyOptional({ description: '次ページ取得用の不透明カーソル(meta.nextCursor の値)' })
	@IsOptional()
	@IsString()
	cursor?: string;
}
