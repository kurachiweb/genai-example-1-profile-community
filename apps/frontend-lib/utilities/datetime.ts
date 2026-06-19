// 日時表示ユーティリティ（BR-COMMON-015 / design/04 §5）。
// 保存は UTC、表示は閲覧者のローカルタイム。世界中の閲覧者が各自の現地時間で日時を読めるようにする。
// 監査ログ・作成日時など、admin / client 双方で再利用するため共通ライブラリに置く。

export type DateInput = Date | string | number;

const DEFAULT_LOCALE = 'ja-JP';

function toValidDate(input: DateInput): Date {
	const date = input instanceof Date ? input : new Date(input);
	if (Number.isNaN(date.getTime())) {
		throw new RangeError(`不正な日時です: ${String(input)}`);
	}
	return date;
}

export interface FormatOptions {
	readonly locale?: string;
	/** 省略時は閲覧者の端末タイムゾーン（Intl 既定）。 */
	readonly timeZone?: string;
}

/** 日付＋時刻をローカルタイムで整形する（例: 2026/06/19 14:30）。 */
export function formatDateTime(input: DateInput, options: FormatOptions = {}): string {
	const date = toValidDate(input);
	return new Intl.DateTimeFormat(options.locale ?? DEFAULT_LOCALE, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		timeZone: options.timeZone
	}).format(date);
}

/** 日付のみをローカルタイムで整形する。 */
export function formatDate(input: DateInput, options: FormatOptions = {}): string {
	const date = toValidDate(input);
	return new Intl.DateTimeFormat(options.locale ?? DEFAULT_LOCALE, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		timeZone: options.timeZone
	}).format(date);
}

const RELATIVE_THRESHOLDS: ReadonlyArray<{
	limit: number;
	unit: Intl.RelativeTimeFormatUnit;
	div: number;
}> = [
	{ limit: 60, unit: 'second', div: 1 },
	{ limit: 3600, unit: 'minute', div: 60 },
	{ limit: 86400, unit: 'hour', div: 3600 },
	{ limit: 604800, unit: 'day', div: 86400 },
	{ limit: 2629800, unit: 'week', div: 604800 },
	{ limit: 31557600, unit: 'month', div: 2629800 }
];

/**
 * 相対表記（例: 3 日前）を返す。実日時は補助提示する前提（design/04 §5）。
 * now を引数にとり決定論的にテストできるようにする。
 */
export function formatRelativeTime(
	input: DateInput,
	now: DateInput = new Date(),
	options: FormatOptions = {}
): string {
	const date = toValidDate(input);
	const base = toValidDate(now);
	const diffSeconds = Math.round((date.getTime() - base.getTime()) / 1000);
	const absSeconds = Math.abs(diffSeconds);
	const rtf = new Intl.RelativeTimeFormat(options.locale ?? DEFAULT_LOCALE, { numeric: 'auto' });

	for (const { limit, unit, div } of RELATIVE_THRESHOLDS) {
		if (absSeconds < limit) {
			return rtf.format(Math.round(diffSeconds / div), unit);
		}
	}
	return rtf.format(Math.round(diffSeconds / 31557600), 'year');
}
