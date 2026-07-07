// app_settings テーブル(db §7)。apps/api の管理画面が書き込む運用設定を key-value で読み取る。
// テーブル定義の正本は apps/api 側(AppSettingEntity)。同一 DB/D1 を参照するため本エンティティは読み取り専用の複製。
import { EntitySchema, Opt } from '@mikro-orm/core';

export class AppSettingEntity {
	key!: string;
	value!: string;
	updatedAt!: Opt<Date>;
}

export const appSettingSchema = new EntitySchema<AppSettingEntity>({
	class: AppSettingEntity,
	tableName: 'app_settings',
	properties: {
		key: { type: 'string', primary: true },
		value: { type: 'string' },
		updatedAt: { type: 'datetime', onCreate: () => new Date(), onUpdate: () => new Date() }
	}
});
