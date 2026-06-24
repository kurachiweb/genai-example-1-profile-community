// Profile のリゾルバ(Interface Adapters / Controller)。薄く保ち、入出力変換とユースケース呼び出しに徹する。
// 実効公開ゲート・認可はユースケース層が評価し、本体には業務ロジックを置かない(coding/04-nestjs.md §3)。
import {
	Args,
	Context,
	Field,
	InputType,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver
} from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { Visibility } from '../../domain/effective-public';

@InputType()
class ReportProfileInput {
	@Field(() => String)
	@IsString()
	handle!: string;

	@Field(() => String)
	@IsString()
	reasonCategory!: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	detail?: string;
}
import { ProfileService } from '../../application/profile.service';
import { presentProfile, presentProfileConnection, presentSnsLink } from './presenter';
import { SnsLinkLoader } from './sns-link.loader';
import {
	ChangeHandleInput,
	ClientSnsLinkInput,
	ListProfilesArgs,
	PublicProfilesArgs,
	ReplaceSnsLinksInput,
	UpdateProfileInput,
	UpdateVisibilityInput
} from './types/inputs';
import { ProfilePayloadType, SnsLinksPayloadType } from './types/payloads';
import { ProfileConnectionType } from './types/profile-connection.type';
import { PublicProfilesConnectionType } from './types/public-profiles-connection.type';
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

	/** profile と同一(client 側の命名規約に合わせたエイリアス)。 */
	@Query(() => ProfileType, { name: 'publicProfile', nullable: true })
	async publicProfile(
		@Args('handle', { type: () => String }) handle: string
	): Promise<ProfileType | null> {
		try {
			return presentProfile(await this.service.getPublicProfileByHandle(handle));
		} catch {
			// 404(NotFoundError)は null で返す(client 側で notFound() を呼ぶ)。
			return null;
		}
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

	/**
	 * 実効公開プロフィールの一覧(オフセットページング・client 向け)。
	 * profiles(カーソル方式)とは別クエリで提供し、後方互換を保つ。
	 */
	@Query(() => PublicProfilesConnectionType, { name: 'publicProfiles' })
	async publicProfiles(@Args() args: PublicProfilesArgs): Promise<PublicProfilesConnectionType> {
		const result = await this.service.listPublicProfilesOffset({
			search: args.search,
			limit: args.limit,
			offset: args.offset
		});
		return {
			total: result.total,
			profiles: result.profiles.map(presentProfile)
		};
	}

	// --- Mutation(1 操作 1 ミューテーション・Payload で包む) ---

	/**
	 * プロフィール内容を更新する(氏名・表示順・職業・自己紹介・ハンドル)。
	 * client との互換のためプロフィールを直接返す(Payload ラッパーなし)。
	 */
	@Mutation(() => ProfileType, { name: 'updateProfile' })
	async updateProfile(
		@Args('input') input: UpdateProfileInput,
		@Context() ctx: GraphQLContext
	): Promise<ProfileType> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		return presentProfile(await this.service.updateProfileContent(viewer, input));
	}

	/** 後方互換用: Payload ラッパー付きの updateProfile(既存の admin client 向け)。 */
	@Mutation(() => ProfilePayloadType, { name: 'updateProfilePayload' })
	async updateProfilePayload(
		@Args('input') input: UpdateProfileInput,
		@Context() ctx: GraphQLContext
	): Promise<ProfilePayloadType> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		return { profile: presentProfile(await this.service.updateProfileContent(viewer, input)) };
	}

	/** 公開/非公開を切り替える(client 向けエイリアス)。 */
	@Mutation(() => ProfileType, { name: 'setProfileVisibility' })
	async setProfileVisibility(
		@Args('visibility', { type: () => String }) visibility: string,
		@Context() ctx: GraphQLContext
	): Promise<ProfileType> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		const profile = await this.service.updateVisibility(viewer, visibility as Visibility);
		return presentProfile(profile);
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

	/** SNS リンクを一括設定する(client 向けエイリアス。displayOrder でソートして sortOrder に変換)。 */
	@Mutation(() => ProfileType, { name: 'setSnsLinks' })
	async setSnsLinks(
		@Args('links', { type: () => [ClientSnsLinkInput] }) links: ClientSnsLinkInput[],
		@Context() ctx: GraphQLContext
	): Promise<ProfileType> {
		const viewer = await this.viewerProvider.resolve(ctx.req);
		// displayOrder でソートし、配列順を sortOrder とする。
		const sorted = [...links].sort((a, b) => a.displayOrder - b.displayOrder);
		await this.service.replaceSnsLinks(
			viewer,
			// SnsPlatform はドメイン側が小文字で管理するため正規化する。
			sorted.map((l) => ({ platform: l.platform.toLowerCase(), url: l.url }))
		);
		// setSnsLinks 後のプロフィール全体を返す(snsLinks は ResolveField で解決)。
		return presentProfile(await this.service.getMyProfile(viewer));
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

	/** プロフィールを通報する(実効公開のみ対象)。 */
	@Mutation(() => Boolean, { name: 'reportProfile' })
	async reportProfile(
		@Args('input') input: ReportProfileInput,
		@Context() ctx: GraphQLContext
	): Promise<boolean> {
		// ログイン不要(匿名通報を許容)。viewer は null でも可。
		void ctx;
		await this.service.reportProfile(input.handle, {
			reasonCategory: input.reasonCategory,
			detail: input.detail
		});
		return true;
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
