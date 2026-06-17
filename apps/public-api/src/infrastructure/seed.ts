// ローカル開発用シード(Frameworks & Drivers)。`pnpm --filter @app/public-api seed` で実行する。
// 公開 API の疎通(認証・スコープ・Read/CRUD・一覧)を手元で確認できるよう、サンプルの
// ユーザー/プロフィールと、既知の生キー値を持つ API キー(read/full)を投入する。
// 生キー値は開発専用。本番(D1)では実行しない(BR-API-001 ではハッシュのみ保存)。
import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { ulid } from 'ulid';
import { ApiKeyScope, ApiKeyStatus } from '../domain/api-key';
import { NameDisplayOrder } from '../domain/display-name';
import { Visibility } from '../domain/effective-public';
import { SnsPlatform } from '../domain/sns-link';
import { UserStatus } from '../domain/user-status';
import { loadEnv } from '../config/env';
import { hashApiKey } from './hashing';
import { buildMikroOrmConfig, resolveDbName } from './mikro-orm.config';
import { ApiKeyEntity } from './persistence/entities/api-key.entity';
import { ProfileEntity } from './persistence/entities/profile.entity';
import { SnsLinkEntity } from './persistence/entities/sns-link.entity';
import { UserEntity } from './persistence/entities/user.entity';

// 開発専用の既知キー(本番では決して使わない)。疎通確認に利用する。
const DEV_FULL_KEY = 'gpc_full_dev_0000000000000000000000';
const DEV_READ_KEY = 'gpc_read_dev_0000000000000000000000';

interface SeedSpec {
	handle: string;
	firstName: string;
	lastName: string;
	order: NameDisplayOrder;
	occupation: string;
	bio: string;
	status: UserStatus;
	visibility: Visibility;
	links: ReadonlyArray<{ platform: SnsPlatform; url: string; label?: string }>;
	/** このユーザーに API キー(read/full)を発行するか。 */
	issueKeys?: boolean;
}

const SEED_PROFILES: readonly SeedSpec[] = [
	{
		handle: 'gpc-owner',
		firstName: 'みなと',
		lastName: '里中',
		order: NameDisplayOrder.FAMILY_FIRST,
		occupation: 'フリーランス イラストレーター',
		bio: '公開 API の疎通確認用オーナー。read/full キーの所有者。',
		status: UserStatus.ACTIVE,
		visibility: Visibility.PUBLIC,
		links: [{ platform: SnsPlatform.WEBSITE, url: 'https://example.com/owner', label: 'サイト' }],
		issueKeys: true
	},
	{
		handle: 'maria-garcia',
		firstName: 'Maria',
		lastName: 'Garcia-Lopez',
		order: NameDisplayOrder.GIVEN_FIRST,
		occupation: 'Software Engineer',
		bio: 'Building web platforms. Open to collaboration.',
		status: UserStatus.ACTIVE,
		visibility: Visibility.PUBLIC,
		links: [{ platform: SnsPlatform.GITHUB, url: 'https://github.com/example-maria' }]
	},
	{
		handle: 'hidden-private',
		firstName: '非公開',
		lastName: 'サンプル',
		order: NameDisplayOrder.FAMILY_FIRST,
		occupation: 'デザイナー',
		bio: '非公開のため他者には 404(BR-COMMON-007 の検証用)。',
		status: UserStatus.ACTIVE,
		visibility: Visibility.PRIVATE,
		links: []
	}
];

function searchName(spec: SeedSpec): string {
	const parts =
		spec.order === NameDisplayOrder.FAMILY_FIRST
			? [spec.lastName, spec.firstName]
			: [spec.firstName, spec.lastName];
	return parts.join(' ').normalize('NFC').toLowerCase();
}

export async function runSeed(): Promise<void> {
	const env = loadEnv();
	const orm = await MikroORM.init(buildMikroOrmConfig(resolveDbName(env.databaseUrl)));
	try {
		// MikroORM 7 は orm.schema(getter)に集約。updateSchema → update。
		await orm.schema.update();
		const em = orm.em.fork();

		for (const spec of SEED_PROFILES) {
			const exists = await em.findOne(ProfileEntity, { handle: spec.handle });
			if (exists) {
				continue;
			}
			const now = new Date();
			const user = em.create(UserEntity, {
				id: ulid(),
				email: `${spec.handle}@example.com`,
				emailNormalized: `${spec.handle}@example.com`,
				passwordHash: 'seed-not-a-real-hash',
				status: spec.status,
				emailVerifiedAt: spec.status === UserStatus.ACTIVE ? now : null
			});
			const profile = em.create(ProfileEntity, {
				id: ulid(),
				user,
				handle: spec.handle,
				visibility: spec.visibility,
				firstName: spec.firstName,
				lastName: spec.lastName,
				nameDisplayOrder: spec.order,
				occupation: spec.occupation,
				searchName: searchName(spec),
				bio: spec.bio
			});
			spec.links.forEach((link, index) => {
				em.create(SnsLinkEntity, {
					id: ulid(),
					profile,
					platform: link.platform,
					url: link.url,
					label: link.label ?? null,
					sortOrder: index
				});
			});

			if (spec.issueKeys) {
				em.create(ApiKeyEntity, {
					id: ulid(),
					user,
					keyHash: hashApiKey(DEV_FULL_KEY),
					label: '開発用 full キー',
					scope: ApiKeyScope.FULL,
					status: ApiKeyStatus.ACTIVE
				});
				em.create(ApiKeyEntity, {
					id: ulid(),
					user,
					keyHash: hashApiKey(DEV_READ_KEY),
					label: '開発用 read キー',
					scope: ApiKeyScope.READ,
					status: ApiKeyStatus.ACTIVE
				});
			}
		}

		await em.flush();
		console.log(`[@app/public-api] seed 完了(${SEED_PROFILES.length} 件のサンプルを確認/投入)`);
		console.log('  開発用 API キー(本番では使用しない):');
		console.log(`    full: ${DEV_FULL_KEY}`);
		console.log(`    read: ${DEV_READ_KEY}`);
		console.log(
			'  例: curl -H "Authorization: Bearer <key>" http://localhost:48034/api/public/v1/me/profile'
		);
	} finally {
		await orm.close(true);
	}
}

if (require.main === module) {
	void runSeed().catch((error: unknown) => {
		console.error('[@app/public-api] seed 失敗:', error);
		process.exitCode = 1;
	});
}
