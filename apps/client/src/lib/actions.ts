// 利用者向けの変更操作 Server Action。Cookie のセッションで api を呼び、成功時に該当パスを再検証する。
// 認可・整合・監査は api 側で強制(本層は薄い呼び出し)。エラーは利用者向け日本語メッセージで返す。
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as api from './api/client';
import { ApiError } from './api/graphql';
import { clearSession } from './auth/session';
import type { UpdateProfileInput, SnsLinkInput } from './api/client';

export interface ActionResult {
	readonly ok: boolean;
	readonly error?: string;
}

function toResult(error: unknown): ActionResult {
	if (error instanceof ApiError) {
		return { ok: false, error: error.message };
	}
	return { ok: false, error: '操作に失敗しました。時間をおいて再度お試しください。' };
}

// --- プロフィール ---

export async function updateProfileAction(input: UpdateProfileInput): Promise<ActionResult> {
	try {
		await api.updateProfile(input);
		revalidatePath('/profile');
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}

export async function setSnsLinksAction(links: SnsLinkInput[]): Promise<ActionResult> {
	try {
		await api.setSnsLinks(links);
		revalidatePath('/profile');
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}

export async function setProfileVisibilityAction(visibility: string): Promise<ActionResult> {
	try {
		await api.setProfileVisibility(visibility);
		revalidatePath('/profile');
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}

// --- アカウント設定 ---

export async function changePasswordAction(
	currentPassword: string,
	newPassword: string
): Promise<ActionResult> {
	try {
		await api.changePassword(currentPassword, newPassword);
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}

export async function requestEmailChangeAction(
	newEmail: string,
	password: string
): Promise<ActionResult> {
	try {
		await api.requestEmailChange(newEmail, password);
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}

export async function withdrawAccountAction(password: string): Promise<ActionResult> {
	try {
		await api.withdrawAccount(password);
		await clearSession();
	} catch (error) {
		return toResult(error);
	}
	redirect('/');
}

export async function resendVerificationEmailAction(): Promise<ActionResult> {
	try {
		await api.resendVerificationEmail();
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}

// --- API キー ---

export async function createApiKeyAction(
	label: string,
	scope: string
): Promise<ActionResult & { rawKey?: string; keyId?: string }> {
	try {
		const key = await api.createApiKey(label, scope);
		revalidatePath('/api-keys');
		return { ok: true, rawKey: key.rawKey, keyId: key.id };
	} catch (error) {
		return toResult(error);
	}
}

export async function revokeApiKeyAction(keyId: string): Promise<ActionResult> {
	try {
		await api.revokeApiKey(keyId);
		revalidatePath('/api-keys');
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}

// --- 通報 ---

export async function reportProfileAction(
	handle: string,
	reasonCategory: string,
	detail?: string
): Promise<ActionResult> {
	try {
		await api.reportProfile(handle, reasonCategory, detail);
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}
