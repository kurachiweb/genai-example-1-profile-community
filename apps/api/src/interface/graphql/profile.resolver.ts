// Profile のリゾルバ(Interface Adapters / Controller)。薄く保ち、入出力変換とユースケース呼び出しに徹する。
// 実効公開ゲート・認可はユースケース層が評価し、本体には業務ロジックを置かない(coding/04-nestjs.md §3)。
import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Visibility } from '../../domain/effective-public';
import { ProfileService } from '../../application/profile.service';
import { presentProfile, presentProfileConnection, presentSnsLink } from './presenter';
import { SnsLinkLoader } from './sns-link.loader';
import {
	ChangeHandleInput,
	ListProfilesArgs,
	ReplaceSnsLinksInput,
	UpdateProfileInput,
	UpdateVisibilityInput
} from './types/inputs';
import { ProfilePayloadType, SnsLinksPayloadType } from './types/payloads';
import { ProfileConnectionType } from './types/profile-connection.type';
import { ProfileType } from './types/profile.type';
import { SnsLinkType } from './types/sns-link.type';
import { RequestLike, ViewerProvider } from './viewer.provider';

interface GraphQLContext {
	readonly req?: RequestLike;
	readonly snsLinkLoader: SnsLinkLoader;
}

@Resolver(() => ProfileType)
export class ProfileResolver {
	constructor(
		private readonly service: ProfileService,
		private readonly viewerProvider: ViewerProvider
	) {}

	// --- Query(副作用なし) ---

	/** ハンドル指定で公開プロフィールを取得する(実効公開のみ、それ以外は 404 で秘匿)。 */
	@Query(() => ProfileType, { name: 'profile' })
	async profile(@Args('handle', { type: () => String }) handle: string): Promise<ProfileType> {
		return presentProfile(await this.service.getPublicProfileByHandle(handle));
	}

	/** 自分のプロフィールを取得する(本人なので非公開でも取得可)。未ログインは UNAUTHORIZED。 */
	@Query(() => ProfileType, { name: 'myProfile' })
	async myProfile(@Context() ctx: GraphQLContext): Promise<ProfileType> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		return presentProfile(await this.service.getMyProfile(viewer));
	}

	/** 実効公開プロフィールの一覧(カーソル接続・氏名/職業/自己紹介検索)。 */
	@Query(() => ProfileConnectionType, { name: 'profiles' })
	async profiles(@Args() args: ListProfilesArgs): Promise<ProfileConnectionType> {
		return presentProfileConnection(
			await this.service.listPublicProfiles({
				first: args.first,
				after: args.after,
				search: args.search
			})
		);
	}

	// --- Mutation(1 操作 1 ミューテーション・Payload で包む) ---

	@Mutation(() => ProfilePayloadType, { name: 'updateProfile' })
	async updateProfile(
		@Args('input') input: UpdateProfileInput,
		@Context() ctx: GraphQLContext
	): Promise<ProfilePayloadType> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		return { profile: presentProfile(await this.service.updateProfileContent(viewer, input)) };
	}

	@Mutation(() => ProfilePayloadType, { name: 'updateProfileVisibility' })
	async updateProfileVisibility(
		@Args('input') input: UpdateVisibilityInput,
		@Context() ctx: GraphQLContext
	): Promise<ProfilePayloadType> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		const profile = await this.service.updateVisibility(viewer, input.visibility as Visibility);
		return { profile: presentProfile(profile) };
	}

	@Mutation(() => ProfilePayloadType, { name: 'changeHandle' })
	async changeHandle(
		@Args('input') input: ChangeHandleInput,
		@Context() ctx: GraphQLContext
	): Promise<ProfilePayloadType> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		return { profile: presentProfile(await this.service.changeHandle(viewer, input.handle)) };
	}

	@Mutation(() => SnsLinksPayloadType, { name: 'replaceSnsLinks' })
	async replaceSnsLinks(
		@Args('input') input: ReplaceSnsLinksInput,
		@Context() ctx: GraphQLContext
	): Promise<SnsLinksPayloadType> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		const links = await this.service.replaceSnsLinks(viewer, input.links);
		return { snsLinks: links.map(presentSnsLink) };
	}

	// --- フィールドリゾルバ(DataLoader でバッチ化、N+1 回避) ---

	@ResolveField(() => [SnsLinkType], { name: 'snsLinks' })
	async snsLinks(
		@Parent() profile: ProfileType,
		@Context() ctx: GraphQLContext
	): Promise<SnsLinkType[]> {
		const records = await ctx.snsLinkLoader.load(profile.id);
		return records.map(presentSnsLink);
	}
}
