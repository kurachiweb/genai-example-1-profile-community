// 監査ログ記録のヘルパー。各ユースケースの変更操作はこれを通して追記する(BR-COMMON-013)。
// id/occurredAt の注入と秘匿値除去(buildAuditLog)を集約し、サービス側を薄く保つ。
import { buildAuditLog, BuildAuditLogInput } from '../../domain/audit-event';
import { Clock, IdGenerator } from '../gateways';
import { AuditLogRepository } from './gateways';

export interface AuditRecorderDeps {
	readonly audit: AuditLogRepository;
	readonly clock: Clock;
	readonly ids: IdGenerator;
}

export type RecordAuditInput = Omit<BuildAuditLogInput, 'id' | 'occurredAt'>;

export class AuditRecorder {
	constructor(private readonly deps: AuditRecorderDeps) {}

	async record(input: RecordAuditInput): Promise<void> {
		const record = buildAuditLog({
			...input,
			id: this.deps.ids.ulid(),
			occurredAt: this.deps.clock.now()
		});
		await this.deps.audit.append(record);
	}
}
