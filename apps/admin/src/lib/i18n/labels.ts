// 表示用ラベル(日本語)とドメイン状態 → 意味的トーンの対応(design/01 §2.3: 色だけに依存しない)。
import type { AdminRole, UserStatus } from '../api/types';

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

export function roleLabel(role: AdminRole): string {
	const map: Record<AdminRole, string> = {
		super_admin: 'スーパー管理者',
		moderator: 'モデレーター',
		support: 'サポート',
		viewer: '閲覧のみ'
	};
	return map[role] ?? role;
}

export function userStatusLabel(status: UserStatus): string {
	const map: Record<UserStatus, string> = {
		UNVERIFIED: '未確認',
		ACTIVE: '有効',
		FROZEN: '凍結',
		WITHDRAWN: '退会済み'
	};
	return map[status] ?? status;
}

export function userStatusTone(status: UserStatus): BadgeTone {
	const map: Record<UserStatus, BadgeTone> = {
		UNVERIFIED: 'warning',
		ACTIVE: 'success',
		FROZEN: 'danger',
		WITHDRAWN: 'neutral'
	};
	return map[status] ?? 'neutral';
}

export function reportStatusLabel(status: string): string {
	const map: Record<string, string> = {
		OPEN: '未対応',
		IN_REVIEW: '審査中',
		RESOLVED: '対応済み',
		DISMISSED: '却下'
	};
	return map[status] ?? status;
}

export function reportReasonLabel(reason: string): string {
	const map: Record<string, string> = {
		inappropriate_image: '不適切な画像',
		impersonation: 'なりすまし',
		spam: 'スパム',
		other: 'その他'
	};
	return map[reason] ?? reason;
}

export function unfreezeStatusLabel(status: string): string {
	const map: Record<string, string> = {
		PENDING: '審査待ち',
		APPROVED: '承認',
		REJECTED: '却下'
	};
	return map[status] ?? status;
}

export function apiKeyStatusLabel(status: string): string {
	return status === 'active' ? '有効' : '失効';
}

// --- §08 コンテンツ系 ---

export function announcementStatusLabel(status: string): string {
	return status === 'published' ? '公開中' : '下書き';
}

export function importanceLabel(importance: string): string {
	return importance === 'important' ? '重要' : '通常';
}

export function helpStatusLabel(status: string): string {
	return status === 'published' ? '公開' : '非公開';
}

export function policyTypeLabel(type: string): string {
	return type === 'privacy' ? 'プライバシーポリシー' : '利用規約';
}

export function inquiryStatusLabel(status: string): string {
	const map: Record<string, string> = {
		OPEN: '未対応',
		IN_PROGRESS: '対応中',
		CLOSED: '完了'
	};
	return map[status] ?? status;
}

export function inquiryStatusTone(status: string): 'warning' | 'info' | 'success' | 'neutral' {
	if (status === 'OPEN') return 'warning';
	if (status === 'IN_PROGRESS') return 'info';
	if (status === 'CLOSED') return 'success';
	return 'neutral';
}

export function inquiryCategoryLabel(category: string): string {
	const map: Record<string, string> = {
		general: '一般',
		report: '通報',
		unfreeze: '解除申請'
	};
	return map[category] ?? category;
}

export function emailStatusLabel(status: string): string {
	return status === 'sent' ? '配信済み' : '下書き';
}

export function emailTargetLabel(condition: string): string {
	return condition === 'verified' ? 'メール確認済みのみ' : '全利用者';
}

// 監査ログのイベント種別 → 日本語(主要なもの。未定義はそのまま表示)。
export function auditEventLabel(eventType: string): string {
	const map: Record<string, string> = {
		'admin.login': '管理者ログイン',
		'admin.login_failed': 'ログイン失敗',
		'admin.logout': '管理者ログアウト',
		'admin.created': '管理者作成',
		'admin.role_changed': '権限変更',
		'admin.disabled': '管理者無効化',
		'admin.passkey_registered': 'パスキー登録',
		'admin.passkey_deleted': 'パスキー削除',
		'user.frozen': 'ユーザー凍結',
		'user.unfrozen': 'ユーザー解除',
		'user.icon_deleted': 'アイコン削除',
		'report.reviewed': '通報審査',
		'unfreeze.reviewed': '解除リクエスト審査',
		'api_key.revoked': 'API キー失効',
		'api.rate_limit_changed': 'レート制限変更'
	};
	return map[eventType] ?? eventType;
}
