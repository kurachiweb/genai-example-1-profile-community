// アカウント関連メール(BR-ACCT-001/003)のテンプレート。§08 のお知らせメール(email-templates.ts)とは
// 目的が異なるため別ファイルに分ける(お知らせは管理者が本文を選ぶが、アカウント通知は固定文言)。
import { escapeHtml } from './email-templates';

/** アカウント通知メール共通の外枠(見出し+本文断片を差し込む)。 */
function renderAccountEmailShell(title: string, bodyHtml: string): string {
	return [
		'<!doctype html>',
		'<html lang="ja"><body style="font-family:system-ui,sans-serif;margin:0;padding:24px;background:#faf7f5">',
		'<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px">',
		`<h1 style="font-size:20px;margin:0 0 12px">${escapeHtml(title)}</h1>`,
		bodyHtml,
		'<hr style="border:none;border-top:1px solid #eee;margin:20px 0">',
		'<p style="color:#999;font-size:12px">心当たりがない場合はこのメールを破棄してください。</p>',
		'</div></body></html>'
	].join('');
}

/** メールアドレス確認リンクを含む本文。確認トークンの有効期限は 24 時間・ワンタイム(BR-ACCT-003)。 */
export function renderVerificationEmailHtml(verifyUrl: string): string {
	const safeUrl = escapeHtml(verifyUrl);
	const body = [
		'<p style="color:#333;line-height:1.7">ご登録ありがとうございます。以下のリンクを開いて、メールアドレスの確認を完了してください。</p>',
		`<p style="margin:20px 0"><a href="${safeUrl}" style="color:#e0654f">${safeUrl}</a></p>`,
		'<p style="color:#333;line-height:1.7">このリンクの有効期限は 24 時間です。期限切れの場合は、ログイン後に確認メールの再送手続きを行ってください。</p>'
	].join('');
	return renderAccountEmailShell('メールアドレスの確認をお願いします', body);
}

/** 既に登録済みのメールアドレス宛の案内(BR-ACCT-001、列挙防止のためトークンは含めない)。 */
export function renderAlreadyRegisteredEmailHtml(): string {
	// ログイン・パスワード再設定は WITHDRAWN のアカウントでは利用できないため、
	// 状態に関わらず案内できるようサポート窓口への導線も添える(状態別の出し分けは列挙防止に反するため行わない)。
	const body =
		'<p style="color:#333;line-height:1.7">このメールアドレスでは既にアカウントが登録されています。' +
		'ログインまたはパスワード再設定をご利用ください。うまくいかない場合はサポートまでお問い合わせください。</p>';
	return renderAccountEmailShell('このメールアドレスは既にご登録済みです', body);
}

/** パスワードリセットリンクを含む本文。トークンの有効期限は 1 時間・ワンタイム(BR-ACCT-006)。 */
export function renderPasswordResetEmailHtml(resetUrl: string): string {
	const safeUrl = escapeHtml(resetUrl);
	const body = [
		'<p style="color:#333;line-height:1.7">パスワード再設定のリクエストを受け付けました。以下のリンクを開いて、新しいパスワードを設定してください。</p>',
		`<p style="margin:20px 0"><a href="${safeUrl}" style="color:#e0654f">${safeUrl}</a></p>`,
		'<p style="color:#333;line-height:1.7">このリンクの有効期限は 1 時間です。心当たりがない場合は、このメールを破棄してください。</p>'
	].join('');
	return renderAccountEmailShell('パスワードの再設定', body);
}

/** パスワード変更完了の通知(BR-ACCT-005、乗っ取り対策として変更を本人に把握させる)。 */
export function renderPasswordChangedEmailHtml(): string {
	const body =
		'<p style="color:#333;line-height:1.7">パスワードが変更されました。心当たりがない場合は、' +
		'第三者による不正利用の可能性があるため、直ちにパスワード再設定を行い、サポートまでお問い合わせください。</p>';
	return renderAccountEmailShell('パスワードが変更されました', body);
}

/** 新メールアドレス宛の変更確認リンク(BR-ACCT-007、確認完了までは旧アドレスが有効)。 */
export function renderEmailChangeConfirmationEmailHtml(confirmUrl: string): string {
	const safeUrl = escapeHtml(confirmUrl);
	const body = [
		'<p style="color:#333;line-height:1.7">このメールアドレスへの変更リクエストを受け付けました。以下のリンクを開いて、変更を確定してください。</p>',
		`<p style="margin:20px 0"><a href="${safeUrl}" style="color:#e0654f">${safeUrl}</a></p>`,
		'<p style="color:#333;line-height:1.7">リンクを開くまでは、現在登録されているメールアドレスが有効です。心当たりがない場合は、このメールを破棄してください。</p>'
	].join('');
	return renderAccountEmailShell('メールアドレス変更の確認をお願いします', body);
}
