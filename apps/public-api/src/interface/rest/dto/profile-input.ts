// プロフィール書き込みの入力 DTO(Interface Adapters、api/02 §10)。
// ここでは構造(型・必須・配列)を class-validator で検証する。文字数・https・件数・予約語などの
// 業務ルールはユースケース層が画面と同一ルールで再検証する(BR-API-006、値の正本は features/)。
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Visibility } from '../../../domain/effective-public';

/** 大文字化前の表記(小文字 public/private)を送る既存クライアントとの互換のため、検証前に大文字化する。 */
function toUppercaseIfString({ value }: { value: unknown }): unknown {
	return typeof value === 'string' ? value.toUpperCase() : value;
}

export class SnsLinkInputDto {
	@ApiProperty({ description: 'SNS 種別(x/github/linkedin/.../website、BR-PROF-007)' })
	@IsString()
	platform!: string;

	@ApiProperty({ description: 'https:// の URL(最大長は BR-PROF-007)' })
	@IsString()
	url!: string;

	@ApiPropertyOptional({ description: '表示ラベル(website 用、任意)' })
	@IsOptional()
	@IsString()
	label?: string | null;
}

/** PUT /me/profile: 全体置換。firstName/lastName は必須。省略フィールドは初期化される。 */
export class PutProfileDto {
	@ApiProperty({ description: '名(必須・最大長は BR-PROF-002)' })
	@IsString()
	firstName!: string;

	@ApiProperty({ description: '姓(必須・最大長は BR-PROF-002)' })
	@IsString()
	lastName!: string;

	@ApiPropertyOptional({ description: '氏名の表示順(givenNameFirst/familyNameFirst)' })
	@IsOptional()
	@IsString()
	nameDisplayOrder?: string;

	@ApiPropertyOptional({ description: '職業・職種(任意、BR-PROF-005)', nullable: true })
	@IsOptional()
	@IsString()
	occupation?: string | null;

	@ApiPropertyOptional({ description: '自己紹介(任意、BR-PROF-006)', nullable: true })
	@IsOptional()
	@IsString()
	bio?: string | null;

	@ApiPropertyOptional({
		description: '公開設定(PUBLIC/PRIVATE、BR-SHARE-005。小文字表記も許容し大文字へ正規化する)'
	})
	@IsOptional()
	@Transform(toUppercaseIfString)
	@IsIn([Visibility.PUBLIC, Visibility.PRIVATE])
	visibility?: string;

	@ApiPropertyOptional({ type: () => [SnsLinkInputDto], description: 'SNS リンク(0〜10 件)' })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SnsLinkInputDto)
	snsLinks?: SnsLinkInputDto[];
}

/** PATCH /me/profile: 部分更新。送られたフィールドのみ更新する。 */
export class PatchProfileDto {
	@ApiPropertyOptional({ description: '名(任意)' })
	@IsOptional()
	@IsString()
	firstName?: string;

	@ApiPropertyOptional({ description: '姓(任意)' })
	@IsOptional()
	@IsString()
	lastName?: string;

	@ApiPropertyOptional({ description: '氏名の表示順(givenNameFirst/familyNameFirst)' })
	@IsOptional()
	@IsString()
	nameDisplayOrder?: string;

	@ApiPropertyOptional({ description: '職業・職種(任意、BR-PROF-005)', nullable: true })
	@IsOptional()
	@IsString()
	occupation?: string | null;

	@ApiPropertyOptional({ description: '自己紹介(任意、BR-PROF-006)', nullable: true })
	@IsOptional()
	@IsString()
	bio?: string | null;

	@ApiPropertyOptional({
		description: '公開設定(PUBLIC/PRIVATE、BR-SHARE-005。小文字表記も許容し大文字へ正規化する)'
	})
	@IsOptional()
	@Transform(toUppercaseIfString)
	@IsIn([Visibility.PUBLIC, Visibility.PRIVATE])
	visibility?: string;

	@ApiPropertyOptional({
		type: () => [SnsLinkInputDto],
		description: 'SNS リンク(0〜10 件・全置換)'
	})
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => SnsLinkInputDto)
	snsLinks?: SnsLinkInputDto[];
}
