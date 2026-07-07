// SettingsRepository(Gateway)の MikroORM 実装。管理画面(apps/api)が書き込む app_settings を読み取る。
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { SettingsRepository } from '../../application/gateways';
import { AppSettingEntity } from './entities/app-setting.entity';

const API_RATE_LIMIT_KEY = 'public_api_rate_limit_per_minute';

@Injectable()
export class MikroSettingsRepository implements SettingsRepository {
	constructor(private readonly em: EntityManager) {}

	async getApiRateLimitPerMinute(): Promise<number | null> {
		const setting = await this.em.fork().findOne(AppSettingEntity, { key: API_RATE_LIMIT_KEY });
		if (!setting) {
			return null;
		}
		const value = Number(setting.value);
		return Number.isInteger(value) ? value : null;
	}
}
