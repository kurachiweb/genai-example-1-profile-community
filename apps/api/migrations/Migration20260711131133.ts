import { Migration } from '@mikro-orm/migrations';

// 退会(WITHDRAWN)後は匿名化がバッチ実行まで遅延するため、email_normalized 単純ユニークだと
// 同一メールでの再登録時に UNIQUE 制約違反になる(user.service.ts withdraw、BR-ACCT-009)。
// WITHDRAWN 行を対象外にした部分ユニークインデックスへ切り替え、再登録・複数回の退会を許容する。
export class Migration20260711131133 extends Migration {
	override up(): void | Promise<void> {
		this.addSql(`drop index \`uq_users_email_normalized\`;`);
		this.addSql(
			`create unique index \`uq_users_email_normalized\` on \`users\` (\`email_normalized\`) where status <> 'WITHDRAWN';`
		);
	}

	override down(): void | Promise<void> {
		this.addSql(`drop index \`uq_users_email_normalized\`;`);
		this.addSql(
			`create unique index \`uq_users_email_normalized\` on \`users\` (\`email_normalized\`);`
		);
	}
}
