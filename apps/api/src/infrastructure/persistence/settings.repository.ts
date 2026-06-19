// SettingsRepository(Gateway)の MikroORM 実装。app_settings に key-value で保持する。
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { DEFAULT_API_RATE_LIMIT_PER_MINUTE } from '../../domain/rate-limit';
import { SettingsRepository } from '../../application/admin/gateways';
import { AppSettingEntity } from './entities/app-setting.entity';

const API_RATE_LIMIT_KEY = 'public_api_rate_limit_per_minute';

@Injectable()
export class MikroSettingsRepository implements SettingsRepository {
	constructor(private readonly em: EntityManager) {}

	async getApiRateLimitPerMinute(): Promise<number> {
		const setting = await this.em.fork().findOne(AppSettingEntity, { key: API_RATE_LIMIT_KEY });
		if (!setting) {
			return DEFAULT_API_RATE_LIMIT_PER_MINUTE;
		}
		const value = Number(setting.value);
		return Number.isInteger(value) ? value : DEFAULT_API_RATE_LIMIT_PER_MINUTE;
	}

	async setApiRateLimitPerMinute(value: number): Promise<void> {
		const em = this.em.fork();
		const existing = await em.findOne(AppSettingEntity, { key: API_RATE_LIMIT_KEY });
		if (existing) {
			existing.value = String(value);
			await em.flush();
			return;
		}
		const entity = em.create(AppSettingEntity, { key: API_RATE_LIMIT_KEY, value: String(value) });
		await em.persist(entity).flush();
	}
}
