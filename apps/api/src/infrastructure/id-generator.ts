// IdGenerator(Gateway)の実装。ULID(26 文字・生成時刻順)を発行する(db §4)。
// テストでは固定シードの偽実装へ差し替える(testing/01 §3)。
import { Injectable } from '@nestjs/common';
import { ulid } from 'ulid';
import { IdGenerator } from '../application/gateways';

@Injectable()
export class UlidGenerator implements IdGenerator {
	ulid(): string {
		return ulid();
	}
}
