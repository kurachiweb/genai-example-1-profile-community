// Clock(Gateway)の実装。テストでは固定クロックへ差し替える(testing/01 §3)。
import { Injectable } from '@nestjs/common';
import { Clock } from '../application/gateways';

@Injectable()
export class SystemClock implements Clock {
	now(): Date {
		return new Date();
	}
}
