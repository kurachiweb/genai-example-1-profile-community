// Mutation の Input 型(Interface Adapters)。
// class-validator は「形（型・必須・配列・粗い上限）」を境界で弾く。書記素長・正規化・https・予約語などの
// 業務ルールはユースケース層(ドメイン検証)が単一の正本として担う(BR-API-006・DRY)。
import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NameDisplayOrder } from '../../../domain/display-name';
import { Visibility } from '../../../domain/effective-public';
import { SNS_LINKS_MAX_COUNT, SNS_URL_MAX_LENGTH } from '../../../domain/limits';

@InputType()
export class UpdateProfileInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn([NameDisplayOrder.GIVEN_FIRST, NameDisplayOrder.FAMILY_FIRST])
  nameDisplayOrder?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  occupation?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bio?: string | null;
}

@InputType()
export class ChangeHandleInput {
  @Field(() => String)
  @IsString()
  handle!: string;
}

@InputType()
export class UpdateVisibilityInput {
  @Field(() => String)
  @IsIn([Visibility.PUBLIC, Visibility.PRIVATE])
  visibility!: string;
}

@InputType()
export class SnsLinkInputType {
  @Field(() => String)
  @IsString()
  platform!: string;

  @Field(() => String)
  @IsString()
  @MaxLength(SNS_URL_MAX_LENGTH)
  url!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  label?: string | null;
}

@InputType()
export class ReplaceSnsLinksInput {
  @Field(() => [SnsLinkInputType])
  @IsArray()
  @ArrayMaxSize(SNS_LINKS_MAX_COUNT)
  @ValidateNested({ each: true })
  @Type(() => SnsLinkInputType)
  links!: SnsLinkInputType[];
}

@ArgsType()
export class ListProfilesArgs {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  first?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  after?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}
