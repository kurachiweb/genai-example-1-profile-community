// §08 コンテンツ系の変更操作 Server Action。api を呼び該当パスを再検証する。認可・整合・監査は api 側。
'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from './api/graphql';
import * as content from './api/content';
import type { ActionResult } from './actions';

function fail(error: unknown): ActionResult {
	return {
		ok: false,
		error:
			error instanceof ApiError
				? error.message
				: '操作に失敗しました。時間をおいて再度お試しください。'
	};
}

// --- お知らせ ---
export async function saveAnnouncementAction(
	id: string | null,
	input: content.AnnouncementInput
): Promise<ActionResult> {
	try {
		if (id) {
			await content.updateAnnouncement(id, input);
		} else {
			await content.createAnnouncement(input);
		}
		revalidatePath('/announcements');
		return { ok: true };
	} catch (error) {
		return fail(error);
	}
}

export async function publishAnnouncementAction(id: string): Promise<ActionResult> {
	try {
		await content.publishAnnouncement(id);
		revalidatePath('/announcements');
		return { ok: true };
	} catch (error) {
		return fail(error);
	}
}

export async function unpublishAnnouncementAction(id: string): Promise<ActionResult> {
	try {
		await content.unpublishAnnouncement(id);
		revalidatePath('/announcements');
		return { ok: true };
	} catch (error) {
		return fail(error);
	}
}

export async function deleteAnnouncementAction(id: string): Promise<ActionResult> {
	try {
		await content.deleteAnnouncement(id);
		revalidatePath('/announcements');
		return { ok: true };
	} catch (error) {
		return fail(error);
	}
}

// --- ヘルプ記事 ---
export async function saveHelpArticleAction(
	input: content.HelpArticleInput
): Promise<ActionResult> {
	try {
		await content.upsertHelpArticle(input);
		revalidatePath('/help');
		return { ok: true };
	} catch (error) {
		return fail(error);
	}
}

export async function setHelpArticleStatusAction(
	id: string,
	status: string
): Promise<ActionResult> {
	try {
		await content.setHelpArticleStatus(id, status);
		revalidatePath('/help');
		return { ok: true };
	} catch (error) {
		return fail(error);
	}
}

// --- 規約 ---
export async function createPolicyVersionAction(
	input: content.PolicyVersionInput
): Promise<ActionResult> {
	try {
		await content.createPolicyVersion(input);
		revalidatePath('/policies');
		return { ok: true };
	} catch (error) {
		return fail(error);
	}
}

export async function publishPolicyAction(id: string): Promise<ActionResult> {
	try {
		await content.publishPolicy(id);
		revalidatePath('/policies');
		return { ok: true };
	} catch (error) {
		return fail(error);
	}
}

// --- 問い合わせ ---
export async function updateInquiryStatusAction(id: string, status: string): Promise<ActionResult> {
	try {
		await content.updateInquiryStatus(id, status);
		revalidatePath('/inquiries');
		return { ok: true };
	} catch (error) {
		return fail(error);
	}
}

// --- メール通知 ---
export async function createEmailNotificationAction(input: {
	subject: string;
	templateKey: string;
	targetCondition: string;
}): Promise<ActionResult> {
	try {
		await content.createEmailNotification(input);
		revalidatePath('/email');
		return { ok: true };
	} catch (error) {
		return fail(error);
	}
}

export async function testSendEmailAction(id: string, toEmail: string): Promise<ActionResult> {
	try {
		await content.testSendEmail(id, toEmail);
		return { ok: true };
	} catch (error) {
		return fail(error);
	}
}

export async function sendEmailNotificationAction(id: string): Promise<ActionResult> {
	try {
		const count = await content.sendEmailNotification(id);
		revalidatePath('/email');
		return { ok: true, error: `${count} 件に配信しました。` };
	} catch (error) {
		return fail(error);
	}
}
