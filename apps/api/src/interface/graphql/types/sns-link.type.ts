// SnsLink の GraphQL 出力型(Interface Adapters / ViewModel)。
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('SnsLink')
export class SnsLinkType {
  @Field(() => String)
  platform!: string;

  @Field(() => String)
  url!: string;

  @Field(() => String, { nullable: true })
  label!: string | null;

  @Field(() => Int)
  sortOrder!: number;
}
