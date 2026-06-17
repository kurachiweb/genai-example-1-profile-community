// 公開 REST API のユースケース(Interactor)。フレームワーク非依存の純粋オーケストレーション。
// スコープ認可(read/full)・所有権・実効公開ゲート・検証呼び出しを担い、HTTP 応答は組み立てない
// (clean-architecture Step 4、coding/04-nestjs.md §3)。エンドポイント正本: features/05-public-api.md §3。
import { assertWriteScope } from '../domain/api-key';
import { decodeCursor, encodeCursor } from '../domain/cursor';
import { buildSearchName, NameDisplayOrder } from '../domain/display-name';
import { effectivePublic, Visibility } from '../domain/effective-public';
import { NotFoundError, ValidationError } from '../domain/errors';
import { PROFILE_LIST_DEFAULT_LIMIT, PROFILE_LIST_MAX_LIMIT } from '../domain/limits';
import { ProfileContentInput, validateProfileContent } from '../domain/profile-fields';
import { SnsLinkInput, validateSnsLinks } from '../domain/sns-link';
import {
	ApiKeyRepository,
	Clock,
	IdGenerator,
	ProfileRepository,
	SnsLinkRepository,
	UserRepository
} from './gateways';
import { ApiPrincipal, ProfileRecord, SnsLinkRecord } from './models';

export interface PublicProfileServiceDeps {
	readonly users: UserRepository;
	readonly apiKeys: ApiKeyRepository;
	readonly profiles: ProfileRepository;
	readonly snsLinks: SnsLinkRepository;
	readonly clock: Clock;
	readonly ids: IdGenerator;
}

/** プロフィールとその SNS リンクの組(REST 応答の単位)。 */
export interface ProfileWithLinks {
	readonly profile: ProfileRecord;
	readonly snsLinks: readonly SnsLinkRecord[];
}

/** PUT /me/profile(全体置換)。firstName/lastName は必須。省略フィールドは初期化される。 */
export interface ReplaceProfileInput {
	readonly firstName: string;
	readonly lastName: string;
	readonly nameDisplayOrder?: string;
	readonly occupation?: string | null;
	readonly bio?: string | null;
	readonly visibility?: string;
	readonly snsLinks?: readonly SnsLinkInput[];
}

/** PATCH /me/profile(部分更新)。送られたフィールドのみ更新する。 */
export interface PatchProfileInput {
	readonly firstName?: string;
	readonly lastName?: string;
	readonly nameDisplayOrder?: string;
	readonly occupation?: string | null;
	readonly bio?: string | null;
	readonly visibility?: string;
	readonly snsLinks?: readonly SnsLinkInput[];
}

export interface ListPublicProfilesInput {
	readonly first?: number;
	readonly after?: string;
}

export interface PublicProfileListResult {
	readonly items: readonly ProfileWithLinks[];
	readonly limit: number;
	readonly nextCursor: string | null;
	readonly hasMore: boolean;
}

const VISIBILITY_VALUES: ReadonlySet<string> = new Set(Object.values(Visibility));

export class PublicProfileService {
	constructor(private readonly deps: PublicProfileServiceDeps) {}

	/** 自分のプロフィールを取得する(本人なのでゲート非適用、非公開でも取得可、AC-API-005)。 */
	async getMyProfile(principal: ApiPrincipal): Promise<ProfileWithLinks> {
		const profile = await this.requireOwnProfile(principal);
		return this.withLinks(profile);
	}

	/** ハンドル指定で他者を含む公開プロフィールを取得する。実効公開でなければ一律 404 で秘匿(AC-API-006/007)。 */
	async getPublicProfileByHandle(handle: string): Promise<ProfileWithLinks> {
		const profile = await this.deps.profiles.findByHandle(handle);
		if (!profile) {
			throw new NotFoundError();
		}
		const owner = await this.deps.users.findById(profile.userId);
		if (!owner || !effectivePublic({ visibility: profile.visibility, ownerStatus: owner.status })) {
			throw new NotFoundError();
		}
		return this.withLinks(profile);
	}

	/** 実効公開プロフィールの一覧(カーソルページング、BR-API-007)。 */
	async listPublicProfiles(input: ListPublicProfilesInput): Promise<PublicProfileListResult> {
		const limit = this.clampLimit(input.first);
		const cursor = input.after ? decodeCursor(input.after) : undefined;

		// hasMore 判定のため 1 件多く取得する。
		const rows = await this.deps.profiles.listEffectivePublic({ limit: limit + 1, cursor });
		const hasMore = rows.length > limit;
		const page = hasMore ? rows.slice(0, limit) : rows;

		const links = await this.deps.snsLinks.findByProfileIds(page.map((p) => p.id));
		const linksByProfile = this.groupLinks(links);
		const items = page.map((profile) => ({
			profile,
			snsLinks: linksByProfile.get(profile.id) ?? []
		}));

		const last = page.at(-1);
		const nextCursor =
			hasMore && last ? encodeCursor({ updatedAt: last.updatedAt.toISOString(), id: last.id }) : null;
		return { items, limit, nextCursor, hasMore };
	}

	/** PUT: 自分のプロフィール全体を作成/置換する。full スコープ必須(BR-API-001b)。 */
	async replaceMyProfile(
		principal: ApiPrincipal,
		input: ReplaceProfileInput
	): Promise<ProfileWithLinks> {
		assertWriteScope(principal.scope);
		const current = await this.requireOwnProfile(principal);

		// 全体置換: 送られなかった内容フィールドは初期値へ戻す(developer-guide §8.1)。
		const normalized = validateProfileContent({
			firstName: input.firstName,
			lastName: input.lastName,
			nameDisplayOrder: input.nameDisplayOrder,
			occupation: input.occupation ?? null,
			bio: input.bio ?? null
		});
		const links = validateSnsLinks(input.snsLinks ?? []);

		const firstName = normalized.firstName ?? '';
		const lastName = normalized.lastName ?? '';
		const nameDisplayOrder = normalized.nameDisplayOrder ?? NameDisplayOrder.GIVEN_FIRST;
		const updated: ProfileRecord = {
			...current,
			firstName,
			lastName,
			nameDisplayOrder,
			occupation: normalized.occupation ?? null,
			bio: normalized.bio ?? null,
			// visibility は内容ではなく公開状態のため、省略時は現状維持(PUT でも自動初期化しない)。
			visibility: this.resolveVisibility(input.visibility, current.visibility),
			searchName: this.deriveSearchName(firstName, lastName, nameDisplayOrder),
			updatedAt: this.deps.clock.now()
		};
		await this.deps.profiles.save(updated);
		const saved = await this.replaceLinks(current.id, links);
		return { profile: updated, snsLinks: saved };
	}

	/** PATCH: 送られたフィールドのみ更新する。full スコープ必須(AC-API-008)。 */
	async patchMyProfile(principal: ApiPrincipal, input: PatchProfileInput): Promise<ProfileWithLinks> {
		assertWriteScope(principal.scope);
		const current = await this.requireOwnProfile(principal);

		// 送られたキーのみを検証対象に含める(undefined は「未指定＝据え置き」)。
		const contentInput: ProfileContentInput = {
			...(input.firstName !== undefined && { firstName: input.firstName }),
			...(input.lastName !== undefined && { lastName: input.lastName }),
			...(input.nameDisplayOrder !== undefined && { nameDisplayOrder: input.nameDisplayOrder }),
			...(input.occupation !== undefined && { occupation: input.occupation }),
			...(input.bio !== undefined && { bio: input.bio })
		};
		const normalized = validateProfileContent(contentInput);

		const firstName = normalized.firstName ?? current.firstName;
		const lastName = normalized.lastName ?? current.lastName;
		const nameDisplayOrder = normalized.nameDisplayOrder ?? current.nameDisplayOrder;
		const updated: ProfileRecord = {
			...current,
			firstName,
			lastName,
			nameDisplayOrder,
			occupation:
				normalized.occupation !== undefined ? normalized.occupation : current.occupation,
			bio: normalized.bio !== undefined ? normalized.bio : current.bio,
			visibility: this.resolveVisibility(input.visibility, current.visibility),
			searchName: this.deriveSearchName(firstName, lastName, nameDisplayOrder),
			updatedAt: this.deps.clock.now()
		};
		await this.deps.profiles.save(updated);

		// snsLinks は送られたときのみ全置換。未指定なら現状を維持して返す。
		if (input.snsLinks !== undefined) {
			const saved = await this.replaceLinks(current.id, validateSnsLinks(input.snsLinks));
			return { profile: updated, snsLinks: saved };
		}
		return this.withLinks(updated);
	}

	/** DELETE: プロフィール内容を消去し非公開化する。アカウントは存続(AC-API-010)。full スコープ必須。 */
	async deleteMyProfile(principal: ApiPrincipal): Promise<ProfileWithLinks> {
		assertWriteScope(principal.scope);
		const current = await this.requireOwnProfile(principal);

		const cleared: ProfileRecord = {
			...current,
			firstName: '',
			lastName: '',
			nameDisplayOrder: NameDisplayOrder.GIVEN_FIRST,
			occupation: null,
			bio: null,
			iconImageId: null,
			searchName: null,
			visibility: Visibility.PRIVATE,
			updatedAt: this.deps.clock.now()
		};
		await this.deps.profiles.save(cleared);
		await this.deps.snsLinks.replaceForProfile(current.id, []);
		return { profile: cleared, snsLinks: [] };
	}

	private async requireOwnProfile(principal: ApiPrincipal): Promise<ProfileRecord> {
		const profile = await this.deps.profiles.findByUserId(principal.userId);
		if (!profile) {
			throw new NotFoundError();
		}
		return profile;
	}

	private async withLinks(profile: ProfileRecord): Promise<ProfileWithLinks> {
		const snsLinks = await this.deps.snsLinks.findByProfileIds([profile.id]);
		return { profile, snsLinks };
	}

	private async replaceLinks(
		profileId: string,
		links: ReturnType<typeof validateSnsLinks>
	): Promise<SnsLinkRecord[]> {
		const now = this.deps.clock.now();
		const records: SnsLinkRecord[] = links.map((link) => ({
			id: this.deps.ids.ulid(),
			profileId,
			platform: link.platform,
			url: link.url,
			label: link.label,
			sortOrder: link.sortOrder,
			createdAt: now
		}));
		await this.deps.snsLinks.replaceForProfile(profileId, records);
		return records;
	}

	private resolveVisibility(value: string | undefined, current: Visibility): Visibility {
		if (value === undefined) {
			return current;
		}
		if (!VISIBILITY_VALUES.has(value)) {
			throw new ValidationError('公開設定の指定が不正です。', [
				{ field: 'visibility', message: 'public または private を指定してください。' }
			]);
		}
		return value as Visibility;
	}

	private deriveSearchName(
		firstName: string,
		lastName: string,
		order: NameDisplayOrder
	): string | null {
		const searchName = buildSearchName(firstName, lastName, order);
		return searchName.length > 0 ? searchName : null;
	}

	private groupLinks(links: readonly SnsLinkRecord[]): Map<string, SnsLinkRecord[]> {
		const grouped = new Map<string, SnsLinkRecord[]>();
		for (const link of links) {
			const list = grouped.get(link.profileId) ?? [];
			list.push(link);
			grouped.set(link.profileId, list);
		}
		return grouped;
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
