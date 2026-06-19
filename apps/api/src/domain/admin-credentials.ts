// 管理者の資格情報(メール・パスワード)の正規化と検証。
// パスワードポリシーの正本は features/01-user-account.md BR-ACCT-002。管理者は高権限のため強めの下限とする。
import { ValidationError } from './errors';

/** メール正規化(トリム・小文字化)。一意判定・引き当てに用いる(db §5.1)。 */
export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

// 簡易なメール形式チェック(厳密な RFC ではなく、実用的な早期検証)。
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
	return EMAIL_PATTERN.test(email.trim());
}

export function assertValidEmail(email: string): void {
	if (!isValidEmail(email)) {
		throw new ValidationError('メールアドレスの形式が正しくありません。', [
			{ field: 'email', message: 'メールアドレスの形式が正しくありません。' }
		]);
	}
}

/** 管理者パスワードの最小長(高権限のため利用者より強めに設定)。 */
export const ADMIN_PASSWORD_MIN_LENGTH = 12;

export function assertValidAdminPassword(password: string): void {
	if (password.length < ADMIN_PASSWORD_MIN_LENGTH) {
		throw new ValidationError('パスワードが要件を満たしていません。', [
			{
				field: 'password',
				message: `パスワードは ${ADMIN_PASSWORD_MIN_LENGTH} 文字以上で設定してください。`
			}
		]);
	}
}
