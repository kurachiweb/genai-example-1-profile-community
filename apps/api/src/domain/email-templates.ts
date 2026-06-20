// メール通知テンプレート(BR-CONTENT-003)。ローカルは簡易 HTML を Mailpit へ送る。
// 本番は MJML(@faire/mjml-react)＋ Amazon SES へ差し替える(MailSender の実装差し替え)。
import { ValidationError } from './errors';

export interface EmailTemplate {
	readonly key: string;
	readonly label: string;
}

export const EMAIL_TEMPLATES: readonly EmailTemplate[] = [
	{ key: 'announcement', label: 'お知らせ(汎用)' },
	{ key: 'maintenance', label: 'メンテナンス案内' },
	{ key: 'feature_update', label: '新機能のお知らせ' }
];

export function isValidTemplateKey(key: string): boolean {
	return EMAIL_TEMPLATES.some((template) => template.key === key);
}

export function assertValidTemplateKey(key: string): void {
	if (!isValidTemplateKey(key)) {
		throw new ValidationError('メールテンプレートが不正です。', [
			{ field: 'templateKey', message: '選択肢から指定してください。' }
		]);
	}
}

function escapeHtml(value: string): string {
	return value.replace(
		/[&<>"]/g,
		(char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char
	);
}

/** 安全な HTML を組み立てる(件名はエスケープ。生 HTML/スクリプトを混入させない、AC-CONTENT-002 同方針)。 */
export function renderEmailHtml(templateKey: string, subject: string): string {
	const safeSubject = escapeHtml(subject);
	return [
		'<!doctype html>',
		'<html lang="ja"><body style="font-family:system-ui,sans-serif;margin:0;padding:24px;background:#faf7f5">',
		'<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px">',
		`<h1 style="font-size:20px;margin:0 0 12px">${safeSubject}</h1>`,
		'<p style="color:#333;line-height:1.7">GenAI Profile Community からのお知らせです。</p>',
		`<p style="color:#999;font-size:12px;margin-top:8px">テンプレート: ${escapeHtml(templateKey)}</p>`,
		'<hr style="border:none;border-top:1px solid #eee;margin:20px 0">',
		'<p style="color:#999;font-size:12px">このお知らせ系メールの配信停止はアカウント設定から行えます。</p>',
		'</div></body></html>'
	].join('');
}
