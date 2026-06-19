// 管理者の変更操作 Server Action。Cookie のセッションで api を呼び、成功時に該当パスを再検証する。
// 認可・整合・監査は api 側で強制(本層は薄い呼び出し)。エラーは利用者向け日本語メッセージで返す。
'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from './api/graphql';
import * as api from './api/admin';

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

export async function freezeUserAction(
	userId: string,
	reasonCategory: string
): Promise<ActionResult> {
	try {
		await api.freezeUser(userId, reasonCategory);
		revalidatePath('/users');
		revalidatePath(`/users/${userId}`);
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}

export async function deleteIconAction(userId: string): Promise<ActionResult> {
	try {
		await api.deleteIcon(userId);
		revalidatePath(`/users/${userId}`);
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}

export async function reviewReportAction(
	reportId: string,
	decision: string
): Promise<ActionResult> {
	try {
		await api.reviewReport(reportId, decision);
		revalidatePath('/reports');
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}

export async function reviewUnfreezeAction(
	requestId: string,
	approve: boolean
): Promise<ActionResult> {
	try {
		await api.reviewUnfreeze(requestId, approve);
		revalidatePath('/unfreeze-requests');
		return { ok: true };
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

export async function setRateLimitAction(value: number): Promise<ActionResult> {
	try {
		await api.setRateLimit(value);
		revalidatePath('/api-keys');
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}

export async function createAdminAction(input: {
	email: string;
	password: string;
	role: string;
}): Promise<ActionResult> {
	try {
		await api.createAdmin(input);
		revalidatePath('/admins');
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}

export async function changeRoleAction(targetId: string, role: string): Promise<ActionResult> {
	try {
		await api.changeRole(targetId, role);
		revalidatePath('/admins');
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}

export async function disableAdminAction(targetId: string): Promise<ActionResult> {
	try {
		await api.disableAdmin(targetId);
		revalidatePath('/admins');
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}

export async function deletePasskeyAction(id: string): Promise<ActionResult> {
	try {
		await api.deletePasskey(id);
		revalidatePath('/settings/passkeys');
		return { ok: true };
	} catch (error) {
		return toResult(error);
	}
}
