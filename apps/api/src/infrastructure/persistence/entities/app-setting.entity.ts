// app_settings テーブル。管理者が変更する運用設定(公開 API 共通レート制限しきい値など)を key-value で保持する。
// 本番のエッジ(Cloudflare WAF)閾値は Terraform 管理で、本値はアプリ層(@nestjs/throttler)用(BR-ADMIN-008)。
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
