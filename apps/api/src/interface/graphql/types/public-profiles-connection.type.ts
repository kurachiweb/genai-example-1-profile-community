// client(apps/client)向けオフセットページング接続型。
// 既存の ProfileConnection(カーソル方式)とは別に、total + profiles を返す。
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ProfileType } from './profile.type';

@ObjectType('PublicProfilesConnection')
export class PublicProfilesConnectionType {
	@Field(() => Int)
	total!: number;

	@Field(() => [ProfileType])
	profiles!: ProfileType[];
}
