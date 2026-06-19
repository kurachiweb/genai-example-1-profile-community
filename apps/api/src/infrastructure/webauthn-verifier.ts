// WebauthnVerifier(Gateway)の実装。暗号検証は @simplewebauthn/server に委譲する(車輪の再発明をしない)。
// origin / rpID / 署名カウンタを検証し、リプレイ・クローンを検出する(BR-COMMON-016)。
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse
} from '@simplewebauthn/server';
import { Injectable } from '@nestjs/common';
import {
	WebauthnAuthenticationOptions,
	WebauthnRegistrationOptions,
	WebauthnVerifiedAuthentication,
	WebauthnVerifiedRegistration,
	WebauthnVerifier
} from '../application/admin/gateways';

export interface WebauthnConfig {
	readonly rpName: string;
	readonly rpId: string;
	readonly origin: string;
}

function toBase64Url(bytes: Uint8Array): string {
	return Buffer.from(bytes).toString('base64url');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
	// ArrayBuffer 裏付けの Uint8Array を返す(@simplewebauthn の型に一致させる)。
	return Uint8Array.from(Buffer.from(value, 'base64url'));
}

@Injectable()
export class SimpleWebauthnVerifier implements WebauthnVerifier {
	constructor(private readonly config: WebauthnConfig) {}

	async generateRegistrationOptions(input: {
		adminId: string;
		adminEmail: string;
		existingCredentialIds: readonly string[];
	}): Promise<WebauthnRegistrationOptions> {
		const options = await generateRegistrationOptions({
			rpName: this.config.rpName,
			rpID: this.config.rpId,
			userID: Uint8Array.from(Buffer.from(input.adminId)),
			userName: input.adminEmail,
			attestationType: 'none',
			excludeCredentials: input.existingCredentialIds.map((id) => ({ id })),
			authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' }
		});
		return {
			challenge: options.challenge,
			optionsJson: options as unknown as Record<string, unknown>
		};
	}

	async verifyRegistration(input: {
		responseJson: Record<string, unknown>;
		expectedChallenge: string;
	}): Promise<WebauthnVerifiedRegistration> {
		const verification = await verifyRegistrationResponse({
			// @simplewebauthn の型(RegistrationResponseJSON)へは境界で受け取った JSON を渡す。
			response: input.responseJson as never,
			expectedChallenge: input.expectedChallenge,
			expectedOrigin: this.config.origin,
			expectedRPID: this.config.rpId,
			requireUserVerification: false
		});
		if (!verification.verified || !verification.registrationInfo) {
			throw new Error('WebAuthn の登録検証に失敗しました。');
		}
		const { credential, aaguid } = verification.registrationInfo;
		return {
			credentialId: credential.id,
			publicKey: toBase64Url(credential.publicKey),
			signCount: credential.counter,
			transports: credential.transports ? JSON.stringify(credential.transports) : null,
			aaguid: aaguid ?? null
		};
	}

	async generateAuthenticationOptions(input: {
		allowCredentialIds: readonly string[];
	}): Promise<WebauthnAuthenticationOptions> {
		const options = await generateAuthenticationOptions({
			rpID: this.config.rpId,
			allowCredentials: input.allowCredentialIds.map((id) => ({ id })),
			userVerification: 'preferred'
		});
		return {
			challenge: options.challenge,
			optionsJson: options as unknown as Record<string, unknown>
		};
	}

	async verifyAuthentication(input: {
		responseJson: Record<string, unknown>;
		expectedChallenge: string;
		credentialPublicKey: string;
		credentialId: string;
		currentSignCount: number;
	}): Promise<WebauthnVerifiedAuthentication> {
		const verification = await verifyAuthenticationResponse({
			response: input.responseJson as never,
			expectedChallenge: input.expectedChallenge,
			expectedOrigin: this.config.origin,
			expectedRPID: this.config.rpId,
			credential: {
				id: input.credentialId,
				publicKey: fromBase64Url(input.credentialPublicKey),
				counter: input.currentSignCount
			},
			requireUserVerification: false
		});
		if (!verification.verified) {
			throw new Error('WebAuthn の認証検証に失敗しました。');
		}
		return { newSignCount: verification.authenticationInfo.newCounter };
	}
}
