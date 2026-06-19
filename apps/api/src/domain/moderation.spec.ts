import {
	assertReportTransition,
	assertUnfreezeTransition,
	canTransitionReport,
	canTransitionUnfreeze,
	ReportStatus,
	UnfreezeRequestStatus
} from './moderation';
import { ValidationError } from './errors';

describe('通報の状態遷移', () => {
	test('OPEN からは審査/処分へ遷移できる', () => {
		expect(canTransitionReport(ReportStatus.OPEN, ReportStatus.IN_REVIEW)).toBe(true);
		expect(canTransitionReport(ReportStatus.OPEN, ReportStatus.RESOLVED)).toBe(true);
		expect(canTransitionReport(ReportStatus.OPEN, ReportStatus.DISMISSED)).toBe(true);
	});

	test('RESOLVED/DISMISSED は終端', () => {
		expect(canTransitionReport(ReportStatus.RESOLVED, ReportStatus.OPEN)).toBe(false);
		expect(canTransitionReport(ReportStatus.DISMISSED, ReportStatus.IN_REVIEW)).toBe(false);
	});

	test('不正遷移は ValidationError', () => {
		expect(() => assertReportTransition(ReportStatus.RESOLVED, ReportStatus.OPEN)).toThrow(
			ValidationError
		);
	});
});

describe('解除リクエストの状態遷移', () => {
	test('PENDING から承認/却下へ遷移できる(AC-ADMIN-007)', () => {
		expect(
			canTransitionUnfreeze(UnfreezeRequestStatus.PENDING, UnfreezeRequestStatus.APPROVED)
		).toBe(true);
		expect(
			canTransitionUnfreeze(UnfreezeRequestStatus.PENDING, UnfreezeRequestStatus.REJECTED)
		).toBe(true);
	});

	test('承認/却下後は再遷移できない', () => {
		expect(
			canTransitionUnfreeze(UnfreezeRequestStatus.APPROVED, UnfreezeRequestStatus.REJECTED)
		).toBe(false);
		expect(() =>
			assertUnfreezeTransition(UnfreezeRequestStatus.REJECTED, UnfreezeRequestStatus.APPROVED)
		).toThrow(ValidationError);
	});
});
