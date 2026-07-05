// モデレーション系エンティティの状態と許可遷移(features/06-trust-and-safety.md が正本)。
// 通報(reports)・凍結(suspensions)・解除リクエスト(unfreeze_requests)のライフサイクルを純粋に表す。
import { ValidationError } from './errors';

// 通報(BR-SAFE-003〜005)
export const ReportStatus = {
	OPEN: 'OPEN',
	IN_REVIEW: 'IN_REVIEW',
	RESOLVED: 'RESOLVED',
	DISMISSED: 'DISMISSED'
} as const;

export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

const REPORT_TRANSITIONS: Record<ReportStatus, readonly ReportStatus[]> = {
	OPEN: [ReportStatus.IN_REVIEW, ReportStatus.RESOLVED, ReportStatus.DISMISSED],
	IN_REVIEW: [ReportStatus.RESOLVED, ReportStatus.DISMISSED],
	RESOLVED: [],
	DISMISSED: []
};

export function canTransitionReport(from: ReportStatus, to: ReportStatus): boolean {
	return REPORT_TRANSITIONS[from].includes(to);
}

export function assertReportTransition(from: ReportStatus, to: ReportStatus): void {
	if (!canTransitionReport(from, to)) {
		throw new ValidationError(`通報の状態 ${from} から ${to} へは遷移できません。`);
	}
}

// 凍結記録(BR-SAFE-006)
export const SuspensionStatus = {
	ACTIVE: 'active',
	LIFTED: 'lifted'
} as const;

export type SuspensionStatus = (typeof SuspensionStatus)[keyof typeof SuspensionStatus];

// 解除リクエスト(BR-SAFE-008)
export const UnfreezeRequestStatus = {
	PENDING: 'PENDING',
	APPROVED: 'APPROVED',
	REJECTED: 'REJECTED'
} as const;

export type UnfreezeRequestStatus =
	(typeof UnfreezeRequestStatus)[keyof typeof UnfreezeRequestStatus];

const UNFREEZE_TRANSITIONS: Record<UnfreezeRequestStatus, readonly UnfreezeRequestStatus[]> = {
	PENDING: [UnfreezeRequestStatus.APPROVED, UnfreezeRequestStatus.REJECTED],
	APPROVED: [],
	REJECTED: []
};

export function canTransitionUnfreeze(
	from: UnfreezeRequestStatus,
	to: UnfreezeRequestStatus
): boolean {
	return UNFREEZE_TRANSITIONS[from].includes(to);
}

export function assertUnfreezeTransition(
	from: UnfreezeRequestStatus,
	to: UnfreezeRequestStatus
): void {
	if (!canTransitionUnfreeze(from, to)) {
		throw new ValidationError(`解除リクエストの状態 ${from} から ${to} へは遷移できません。`);
	}
}

// 通報理由区分(db §5.7)
export const ReportReasonCategory = {
	INAPPROPRIATE_IMAGE: 'inappropriate_image',
	IMPERSONATION: 'impersonation',
	HARASSMENT: 'harassment',
	SPAM: 'spam',
	OTHER: 'other'
} as const;

export type ReportReasonCategory = (typeof ReportReasonCategory)[keyof typeof ReportReasonCategory];

export function isReportReasonCategory(value: string): value is ReportReasonCategory {
	return (Object.values(ReportReasonCategory) as string[]).includes(value);
}
