import { Migration } from '@mikro-orm/migrations';

// profiles.visibility の格納値を大文字(PUBLIC/PRIVATE)に統一する(BR-SHARE-005)。
// 既存行に 'public'/'private' の小文字表記が混在していたため、まず全行を正規化してから
// 既定値を新表記へ合わせる。SQLite は ALTER TABLE で既定値のみを変更できないため、
// テーブル再作成戦略を用いる(db/02-migrations.md §4)。
export class Migration20260710120000 extends Migration {
	override up(): void | Promise<void> {
		this.addSql(
			'update `profiles` set `visibility` = upper(`visibility`) where `visibility` <> upper(`visibility`);'
		);

		this.addSql('pragma foreign_keys = off;');
		this.addSql(
			`create table \`profiles__temp_alter\` (\`id\` text not null primary key, \`user_id\` text not null, \`handle\` text not null, \`visibility\` text not null default 'PUBLIC', \`icon_image_id\` text null, \`first_name\` text not null default '', \`last_name\` text not null default '', \`name_display_order\` text not null default 'givenNameFirst', \`occupation\` text null, \`search_name\` text null, \`bio\` text null, \`created_at\` datetime not null, \`updated_at\` datetime not null, constraint \`profiles_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade on delete cascade);`
		);
		this.addSql(
			'insert into `profiles__temp_alter` select `id`, `user_id`, `handle`, `visibility`, `icon_image_id`, `first_name`, `last_name`, `name_display_order`, `occupation`, `search_name`, `bio`, `created_at`, `updated_at` from `profiles`;'
		);
		this.addSql('drop table `profiles`;');
		this.addSql('alter table `profiles__temp_alter` rename to `profiles`;');
		this.addSql('create unique index `uq_profiles_user_id` on `profiles` (`user_id`);');
		this.addSql('create unique index `uq_profiles_handle` on `profiles` (`handle`);');
		this.addSql(
			'create index `idx_profiles_visibility_updated` on `profiles` (`visibility`, `updated_at`);'
		);
		this.addSql('create index `idx_profiles_occupation` on `profiles` (`occupation`);');
		this.addSql('create index `idx_profiles_search_name` on `profiles` (`search_name`);');
		this.addSql('pragma foreign_keys = on;');
	}

	// 注意: down() は up() の厳密な逆操作ではない。up() 前の元データは大文字・小文字が混在していたが、
	// down() は一律で小文字へ戻すため、正規化前の混在状態そのものは復元されない(既定値のみ 'public' に戻す)。
	override down(): void | Promise<void> {
		this.addSql('pragma foreign_keys = off;');
		this.addSql(
			`create table \`profiles__temp_alter\` (\`id\` text not null primary key, \`user_id\` text not null, \`handle\` text not null, \`visibility\` text not null default 'public', \`icon_image_id\` text null, \`first_name\` text not null default '', \`last_name\` text not null default '', \`name_display_order\` text not null default 'givenNameFirst', \`occupation\` text null, \`search_name\` text null, \`bio\` text null, \`created_at\` datetime not null, \`updated_at\` datetime not null, constraint \`profiles_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade on delete cascade);`
		);
		this.addSql(
			'insert into `profiles__temp_alter` select `id`, `user_id`, `handle`, `visibility`, `icon_image_id`, `first_name`, `last_name`, `name_display_order`, `occupation`, `search_name`, `bio`, `created_at`, `updated_at` from `profiles`;'
		);
		this.addSql('drop table `profiles`;');
		this.addSql('alter table `profiles__temp_alter` rename to `profiles`;');
		this.addSql('create unique index `uq_profiles_user_id` on `profiles` (`user_id`);');
		this.addSql('create unique index `uq_profiles_handle` on `profiles` (`handle`);');
		this.addSql(
			'create index `idx_profiles_visibility_updated` on `profiles` (`visibility`, `updated_at`);'
		);
		this.addSql('create index `idx_profiles_occupation` on `profiles` (`occupation`);');
		this.addSql('create index `idx_profiles_search_name` on `profiles` (`search_name`);');
		this.addSql(
			"update `profiles` set `visibility` = lower(`visibility`) where `visibility` in ('PUBLIC', 'PRIVATE');"
		);
		this.addSql('pragma foreign_keys = on;');
	}
}
