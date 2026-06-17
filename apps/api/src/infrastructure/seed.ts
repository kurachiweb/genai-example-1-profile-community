// ローカル開発用シード(Frameworks & Drivers)。`pnpm --filter @app/api seed` で実行する。
// 公開ページ・一覧・検索を手元で確認できるよう、実効公開のサンプルプロフィールを投入する。
// 本番(D1)では実行しない(ローカル/dev 専用)。
import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { ulid } from 'ulid';
import { NameDisplayOrder } from '../domain/display-name';
import { Visibility } from '../domain/effective-public';
import { SnsPlatform } from '../domain/sns-link';
import { UserStatus } from '../domain/user-status';
import { loadEnv } from '../config/env';
import { buildMikroOrmConfig, resolveDbName } from './mikro-orm.config';
import { ProfileEntity } from './persistence/entities/profile.entity';
import { SnsLinkEntity } from './persistence/entities/sns-link.entity';
import { UserEntity } from './persistence/entities/user.entity';

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
}

const SEED_PROFILES: readonly SeedSpec[] = [
	{
		handle: 'minato-satonaka',
		firstName: 'みなと',
		lastName: '里中',
		order: NameDisplayOrder.FAMILY_FIRST,
		occupation: 'フリーランス イラストレーター',
		bio: 'キャラクターデザインと装画を手がけています。お仕事のご相談はリンクから。',
		status: UserStatus.ACTIVE,
		visibility: Visibility.PUBLIC,
		links: [
			{ platform: SnsPlatform.X, url: 'https://x.com/example-minato' },
			{ platform: SnsPlatform.WEBSITE, url: 'https://example.com/minato', label: 'ポートフォリオ' }
		]
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
		handle: 'unverified-sample',
		firstName: '未確認',
		lastName: 'サンプル',
		order: NameDisplayOrder.FAMILY_FIRST,
		occupation: 'デザイナー',
		bio: 'メール未確認のため第三者には 404(BR-COMMON-007 の検証用)。',
		status: UserStatus.UNVERIFIED,
		visibility: Visibility.PUBLIC,
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
		}

		await em.flush();
		console.log(`[@app/api] seed 完了(${SEED_PROFILES.length} 件のサンプルを確認/投入)`);
	} finally {
		await orm.close(true);
	}
}

if (require.main === module) {
	void runSeed().catch((error: unknown) => {
		console.error('[@app/api] seed 失敗:', error);
		process.exitCode = 1;
	});
}
