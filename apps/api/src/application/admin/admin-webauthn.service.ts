// 管理者の WebAuthn(パスキー)登録・認証・削除のユースケース(BR-COMMON-016・AC-ADMIN-013)。
// チャレンジはサーバー発行・短命・ワンタイム。暗号検証は WebauthnVerifier(@simplewebauthn)に委譲する。
// 利用者とはストアを分離し、別テーブル(admin_webauthn_credentials)で保持する(BR-COMMON-002)。
import { PASSKEY_NICKNAME_MAX_GRAPHEMES } from '../../domain/admin-limits';
import { normalizeEmail } from '../../domain/admin-credentials';
import { AuditActorType, AuditEventType, AuditResult } from '../../domain/audit-event';
import { UnauthorizedError, ValidationError } from '../../domain/errors';
import { withinGraphemeLimit } from '../../domain/grapheme';
import { Clock, IdGenerator } from '../gateways';
import { AuditRecorder } from './audit-recorder';
import {
	AdminAccountRepository,
	AdminSession,
	AdminSessionStore,
	AdminWebauthnCredentialRecord,
	AdminWebauthnCredentialRepository,
	WebauthnChallengeStore,
	WebauthnVerifier
} from './gateways';
import { AdminPrincipal } from './models';

export interface AdminWebauthnServiceDeps {
	readonly admins: AdminAccountRepository;
	readonly creds: AdminWebauthnCredentialRepository;
	readonly challenges: WebauthnChallengeStore;
	readonly verifier: WebauthnVerifier;
	readonly sessions: AdminSessionStore;
	readonly audit: AuditRecorder;
	readonly clock: Clock;
	readonly ids: IdGenerator;
}

export interface PasskeyView {
	readonly id: string;
	readonly nickname: string | null;
	readonly createdAt: Date;
	readonly lastUsedAt: Date | null;
}

const INVALID_CHALLENGE = 'チャレンジが無効か期限切れです。もう一度お試しください。';

export class AdminWebauthnService {
	constructor(private readonly deps: AdminWebauthnServiceDeps) {}

	async listPasskeys(actor: AdminPrincipal): Promise<PasskeyView[]> {
		const records = await this.deps.creds.listByAdmin(actor.adminId);
		return records.map((record) => ({
			id: record.id,
			nickname: record.nickname,
			createdAt: record.createdAt,
			lastUsedAt: record.lastUsedAt
		}));
	}

	async startRegistration(actor: AdminPrincipal): Promise<Record<string, unknown>> {
		const admin = await this.deps.admins.findById(actor.adminId);
		if (!admin) {
			throw new UnauthorizedError();
		}
		const existing = await this.deps.creds.listByAdmin(actor.adminId);
		const options = await this.deps.verifier.generateRegistrationOptions({
			adminId: admin.id,
			adminEmail: admin.email,
			existingCredentialIds: existing.map((credential) => credential.credentialId)
		});
		await this.deps.challenges.put(this.regKey(actor.adminId), options.challenge);
		return options.optionsJson;
	}

	async finishRegistration(
		actor: AdminPrincipal,
		responseJson: Record<string, unknown>,
		nickname?: string | null
	): Promise<PasskeyView> {
		const trimmedNickname = nickname?.trim() ? nickname.trim() : null;
		if (trimmedNickname && !withinGraphemeLimit(trimmedNickname, PASSKEY_NICKNAME_MAX_GRAPHEMES)) {
			throw new ValidationError('表示名が長すぎます。', [
				{
					field: 'nickname',
					message: `${PASSKEY_NICKNAME_MAX_GRAPHEMES} 文字以内で入力してください。`
				}
			]);
		}
		const expectedChallenge = await this.deps.challenges.take(this.regKey(actor.adminId));
		if (!expectedChallenge) {
			throw new UnauthorizedError(INVALID_CHALLENGE);
		}
		const verified = await this.deps.verifier.verifyRegistration({
			responseJson,
			expectedChallenge
		});

		const now = this.deps.clock.now();
		const record: AdminWebauthnCredentialRecord = {
			id: this.deps.ids.ulid(),
			adminAccountId: actor.adminId,
			credentialId: verified.credentialId,
			publicKey: verified.publicKey,
			signCount: verified.signCount,
			transports: verified.transports,
			aaguid: verified.aaguid,
			nickname: trimmedNickname,
			lastUsedAt: null,
			createdAt: now
		};
		await this.deps.creds.save(record);
		await this.deps.audit.record({
			eventType: AuditEventType.ADMIN_PASSKEY_REGISTERED,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'admin_passkey',
			targetId: record.id,
			metadata: { nickname: trimmedNickname }
		});
		return {
			id: record.id,
			nickname: record.nickname,
			createdAt: record.createdAt,
			lastUsedAt: null
		};
	}

	async deletePasskey(actor: AdminPrincipal, credentialRecordId: string): Promise<void> {
		await this.deps.creds.delete(credentialRecordId, actor.adminId);
		await this.deps.audit.record({
			eventType: AuditEventType.ADMIN_PASSKEY_DELETED,
			actorType: AuditActorType.ADMIN,
			actorId: actor.adminId,
			targetType: 'admin_passkey',
			targetId: credentialRecordId
		});
	}

	/** パスキー認証(パスワードレスログイン)の開始。列挙防止のため、未登録メールでも形だけの選択肢を返す。 */
	async startAuthentication(email: string): Promise<Record<string, unknown>> {
		const normalized = normalizeEmail(email);
		const admin = await this.deps.admins.findByEmailNormalized(normalized);
		const credentials = admin ? await this.deps.creds.listByAdmin(admin.id) : [];
		const options = await this.deps.verifier.generateAuthenticationOptions({
			allowCredentialIds: credentials.map((credential) => credential.credentialId)
		});
		await this.deps.challenges.put(this.authKey(normalized), options.challenge);
		return options.optionsJson;
	}

	async finishAuthentication(
		email: string,
		responseJson: Record<string, unknown>
	): Promise<{ session: AdminSession; principal: AdminPrincipal }> {
		const normalized = normalizeEmail(email);
		const expectedChallenge = await this.deps.challenges.take(this.authKey(normalized));
		if (!expectedChallenge) {
			throw new UnauthorizedError(INVALID_CHALLENGE);
		}
		const admin = await this.deps.admins.findByEmailNormalized(normalized);
		const credentialId = typeof responseJson.id === 'string' ? responseJson.id : '';
		const credential = credentialId ? await this.deps.creds.findByCredentialId(credentialId) : null;

		if (
			!admin ||
			admin.status !== 'active' ||
			!credential ||
			credential.adminAccountId !== admin.id
		) {
			await this.deps.audit.record({
				eventType: AuditEventType.ADMIN_LOGIN_FAILED,
				actorType: AuditActorType.ADMIN,
				actorId: admin?.id ?? null,
				result: AuditResult.FAILURE,
				metadata: { email: normalized, method: 'passkey' }
			});
			throw new UnauthorizedError('パスキー認証に失敗しました。');
		}

		const verified = await this.deps.verifier.verifyAuthentication({
			responseJson,
			expectedChallenge,
			credentialPublicKey: credential.publicKey,
			credentialId: credential.credentialId,
			currentSignCount: credential.signCount
		});
		const now = this.deps.clock.now();
		await this.deps.creds.updateSignCount(credential.id, verified.newSignCount, now);

		const session = await this.deps.sessions.create(admin.id);
		await this.deps.audit.record({
			eventType: AuditEventType.ADMIN_LOGIN,
			actorType: AuditActorType.ADMIN,
			actorId: admin.id,
			metadata: { method: 'passkey' }
		});
		return { session, principal: { adminId: admin.id, role: admin.role } };
	}

	private regKey(adminId: string): string {
		return `tok:webauthn:reg:admin:${adminId}`;
	}

	private authKey(email: string): string {
		return `tok:webauthn:auth:admin:${email}`;
	}
}
