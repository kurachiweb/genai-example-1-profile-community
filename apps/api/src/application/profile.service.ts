// プロフィール共有のユースケース(Interactor)。フレームワーク非依存の純粋オーケストレーション。
// 認可(所有権)・実効公開ゲート・検証呼び出し・トランザクション境界を担い、
// HTTP/GraphQL の応答は組み立てない(clean-architecture Step 4、coding/04-nestjs.md §3)。
import { decodeCursor, encodeCursor } from '../domain/cursor';
import { buildSearchName, NameDisplayOrder } from '../domain/display-name';
import { effectivePublic, Visibility } from '../domain/effective-public';
import {
	ForbiddenError,
	NotFoundError,
	UnauthorizedError,
	ValidationError
} from '../domain/errors';
import { assertAssignableHandle } from '../domain/handle';
import {
	PROFILE_LIST_DEFAULT_LIMIT,
	PROFILE_LIST_MAX_LIMIT,
	SNS_URL_MAX_LENGTH
} from '../domain/limits';
import { ProfileContentInput, validateProfileContent } from '../domain/profile-fields';
import { SnsLinkInput, validateSnsLinks } from '../domain/sns-link';
import { canEditProfile } from '../domain/user-status';
import {
	Clock,
	IdGenerator,
	ProfileListOffsetResult,
	ProfileRepository,
	SnsLinkRepository,
	UserRepository
} from './gateways';
import { ProfileRecord, SnsLinkRecord, Viewer } from './models';

export interface ReportInput {
	readonly reasonCategory: string;
	readonly detail?: string | null;
}

export interface ReportRecord {
	readonly id: string;
	readonly targetUserId: string | null;
	readonly targetHandle: string;
	readonly reasonCategory: string;
	readonly detail: string | null;
}

export interface ReportGateway {
	create(record: ReportRecord): Promise<void>;
}

export interface ProfileServiceDeps {
	readonly users: UserRepository;
	readonly profiles: ProfileRepository;
	readonly snsLinks: SnsLinkRepository;
	readonly clock: Clock;
	readonly ids: IdGenerator;
	readonly reports?: ReportGateway;
}

export interface ListPublicProfilesInput {
	readonly first?: number;
	readonly after?: string;
	readonly search?: string;
}

export interface ListPublicProfilesOffsetInput {
	readonly search?: string;
	readonly limit?: number;
	readonly offset?: number;
}

export interface ProfileEdge {
	readonly node: ProfileRecord;
	readonly cursor: string;
}

export interface ProfileConnectionResult {
	readonly edges: readonly ProfileEdge[];
	readonly hasNextPage: boolean;
	readonly endCursor: string | null;
}

export class ProfileService {
	constructor(private readonly deps: ProfileServiceDeps) {}

	/** ハンドル指定で他者を含む公開プロフィールを取得する。実効公開でなければ一律 404 で秘匿(BR-SHARE-006)。 */
	async getPublicProfileByHandle(handle: string): Promise<ProfileRecord> {
		const profile = await this.deps.profiles.findByHandle(handle);
		if (!profile) {
			throw new NotFoundError();
		}
		const owner = await this.deps.users.findById(profile.userId);
		if (!owner || !effectivePublic({ visibility: profile.visibility, ownerStatus: owner.status })) {
			throw new NotFoundError();
		}
		return profile;
	}

	/** 自分のプロフィールを取得する(本人なのでゲート非適用、非公開でも取得可、AC-API-005)。 */
	async getMyProfile(viewer: Viewer | null): Promise<ProfileRecord> {
		const profile = await this.requireOwnProfile(viewer);
		return profile;
	}

	/** 実効公開プロフィールの一覧(カーソル接続)。検索語があれば氏名/職業/自己紹介の中間一致。 */
	async listPublicProfiles(input: ListPublicProfilesInput): Promise<ProfileConnectionResult> {
		const limit = this.clampLimit(input.first);
		const cursor = input.after ? decodeCursor(input.after) : undefined;
		const search = input.search?.trim() ? input.search.trim() : undefined;

		// hasNextPage 判定のため 1 件多く取得する。
		const rows = await this.deps.profiles.listEffectivePublic({ search, limit: limit + 1, cursor });
		const hasNextPage = rows.length > limit;
		const page = hasNextPage ? rows.slice(0, limit) : rows;

		const edges = page.map((node) => ({
			node,
			cursor: encodeCursor({ updatedAt: node.updatedAt.toISOString(), id: node.id })
		}));
		return {
			edges,
			hasNextPage,
			endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
		};
	}

	/** オフセットページングで実効公開プロフィールを取得する(client 向け)。 */
	async listPublicProfilesOffset(
		input: ListPublicProfilesOffsetInput
	): Promise<ProfileListOffsetResult> {
		const limit = Math.min(Math.max(input.limit ?? PROFILE_LIST_DEFAULT_LIMIT, 1), PROFILE_LIST_MAX_LIMIT);
		const offset = Math.max(input.offset ?? 0, 0);
		const search = input.search?.trim() || undefined;
		return this.deps.profiles.listEffectivePublicOffset({ search, limit, offset });
	}

	/** 自分のプロフィール内容を更新する(氏名・表示順・職業・自己紹介・ハンドル)。 */
	async updateProfileContent(
		viewer: Viewer | null,
		input: ProfileContentInput & { handle?: string }
	): Promise<ProfileRecord> {
		const current = await this.requireEditableOwnProfile(viewer);

		// ハンドル変更が含まれている場合は先に処理する。
		let profile = current;
		if (input.handle !== undefined && input.handle !== current.handle) {
			assertAssignableHandle(input.handle);
			const existing = await this.deps.profiles.findByHandle(input.handle);
			if (existing && existing.id !== current.id) {
				throw new ValidationError('このハンドルは使用できません。', [
					{ field: 'handle', message: '既に使用されています。' }
				]);
			}
			profile = { ...profile, handle: input.handle, updatedAt: this.deps.clock.now() };
		}

		const normalized = validateProfileContent(input);

		const firstName = normalized.firstName ?? profile.firstName;
		const lastName = normalized.lastName ?? profile.lastName;
		const nameDisplayOrder = normalized.nameDisplayOrder ?? profile.nameDisplayOrder;

		const updated: ProfileRecord = {
			...profile,
			firstName,
			lastName,
			nameDisplayOrder,
			occupation: normalized.occupation !== undefined ? normalized.occupation : profile.occupation,
			bio: normalized.bio !== undefined ? normalized.bio : profile.bio,
			searchName: this.deriveSearchName(firstName, lastName, nameDisplayOrder),
			updatedAt: this.deps.clock.now()
		};
		await this.deps.profiles.save(updated);
		return updated;
	}

	/** 公開/非公開を切り替える(BR-SHARE-005)。 */
	async updateVisibility(viewer: Viewer | null, visibility: Visibility): Promise<ProfileRecord> {
		const current = await this.requireEditableOwnProfile(viewer);
		const updated: ProfileRecord = { ...current, visibility, updatedAt: this.deps.clock.now() };
		await this.deps.profiles.save(updated);
		return updated;
	}

	/** ハンドルを変更する(形式・予約語・一意性、BR-SHARE-001/002)。 */
	async changeHandle(viewer: Viewer | null, handle: string): Promise<ProfileRecord> {
		const current = await this.requireEditableOwnProfile(viewer);
		assertAssignableHandle(handle);

		const existing = await this.deps.profiles.findByHandle(handle);
		if (existing && existing.id !== current.id) {
			throw new ValidationError('このハンドルは使用できません。', [
				{ field: 'handle', message: '既に使用されています。' }
			]);
		}
		const updated: ProfileRecord = { ...current, handle, updatedAt: this.deps.clock.now() };
		await this.deps.profiles.save(updated);
		return updated;
	}

	/** SNS リンクを一括設定する(0〜10 件・https のみ・種別、BR-PROF-007)。 */
	async replaceSnsLinks(
		viewer: Viewer | null,
		links: readonly SnsLinkInput[]
	): Promise<SnsLinkRecord[]> {
		const current = await this.requireEditableOwnProfile(viewer);
		const normalized = validateSnsLinks(links);
		const now = this.deps.clock.now();

		const records: SnsLinkRecord[] = normalized.map((link) => ({
			id: this.deps.ids.ulid(),
			profileId: current.id,
			platform: link.platform,
			url: link.url,
			label: link.label,
			sortOrder: link.sortOrder,
			createdAt: now
		}));
		await this.deps.snsLinks.replaceForProfile(current.id, records);
		return records;
	}

	/** DataLoader 用: 複数プロフィールの SNS リンクをまとめて取得する。 */
	async getSnsLinksByProfileIds(profileIds: readonly string[]): Promise<SnsLinkRecord[]> {
		return this.deps.snsLinks.findByProfileIds(profileIds);
	}

	/**
	 * 公開プロフィールを通報する(BR-SAFE-001)。
	 * 実効公開でなければ 404(秘匿)。通報者 ID は匿名で記録しない(仕様)。
	 */
	async reportProfile(handle: string, input: ReportInput): Promise<void> {
		if (!this.deps.reports) {
			// レポートゲートウェイが未設定の場合は無操作(テスト・開発環境用スタブ)。
			return;
		}
		const profile = await this.getPublicProfileByHandle(handle);
		if (input.detail && input.detail.length > SNS_URL_MAX_LENGTH) {
			throw new ValidationError('詳細が長すぎます。', [
				{ field: 'detail', message: `最大 ${SNS_URL_MAX_LENGTH} 文字です。` }
			]);
		}
		await this.deps.reports.create({
			id: this.deps.ids.ulid(),
			targetUserId: profile.userId,
			targetHandle: handle,
			reasonCategory: input.reasonCategory,
			detail: input.detail ?? null
		});
	}

	private async requireOwnProfile(viewer: Viewer | null): Promise<ProfileRecord> {
		if (!viewer) {
			throw new UnauthorizedError();
		}
		const profile = await this.deps.profiles.findByUserId(viewer.userId);
		if (!profile) {
			throw new NotFoundError();
		}
		return profile;
	}

	private async requireEditableOwnProfile(viewer: Viewer | null): Promise<ProfileRecord> {
		const profile = await this.requireOwnProfile(viewer);
		// FROZEN/WITHDRAWN は編集不可(BR-COMMON-005)。viewer が null の場合は上で 401 済み。
		if (!viewer || !canEditProfile(viewer.status)) {
			throw new ForbiddenError('現在のアカウント状態ではプロフィールを編集できません。');
		}
		return profile;
	}

	private deriveSearchName(
		firstName: string,
		lastName: string,
		order: NameDisplayOrder
	): string | null {
		const searchName = buildSearchName(firstName, lastName, order);
		return searchName.length > 0 ? searchName : null;
	}

	private clampLimit(first?: number): number {
		if (first === undefined) {
			return PROFILE_LIST_DEFAULT_LIMIT;
		}
		const floored = Math.floor(first);
		if (Number.isNaN(floored) || floored < 1) {
			return 1;
		}
		return Math.min(floored, PROFILE_LIST_MAX_LIMIT);
	}
}
