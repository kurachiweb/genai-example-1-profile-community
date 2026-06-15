// Mutation の Payload 型(api/01-graphql-internal.md §2.3: 戻り値は Payload で包む)。
import { Field, ObjectType } from '@nestjs/graphql';
import { ProfileType } from './profile.type';
import { SnsLinkType } from './sns-link.type';

@ObjectType('ProfilePayload')
export class ProfilePayloadType {
	@Field(() => ProfileType)
	profile!: ProfileType;
}

@ObjectType('SnsLinksPayload')
export class SnsLinksPayloadType {
	@Field(() => [SnsLinkType])
	snsLinks!: SnsLinkType[];
}
