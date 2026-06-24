import { formatDate, formatDateTime, formatRelativeTime } from '@lib/utilities/datetime';

// 端末タイムゾーン差を排除するため、検証では timeZone を固定する。
const TZ = 'Asia/Tokyo';

describe('formatDateTime', () => {
	test('UTC 保存値をローカルタイム（指定 TZ）で整形する', () => {
		// 2026-06-19T05:30:00Z は JST で 14:30。
		const result = formatDateTime('2026-06-19T05:30:00Z', { timeZone: TZ });

		expect(result).toContain('2026');
		expect(result).toContain('14:30');
	});

	test('Date / 数値（epoch ms）も受け取れる', () => {
		const epoch = Date.UTC(2026, 5, 19, 5, 30, 0);
		expect(formatDateTime(new Date(epoch), { timeZone: TZ })).toContain('14:30');
		expect(formatDateTime(epoch, { timeZone: TZ })).toContain('14:30');
	});

	test('不正な日時は RangeError を投げる', () => {
		expect(() => formatDateTime('not-a-date')).toThrow(RangeError);
	});
});

describe('formatDate', () => {
	test('日付のみを整形する', () => {
		const result = formatDate('2026-06-19T05:30:00Z', { timeZone: TZ });

		expect(result).toContain('2026');
		expect(result).not.toContain('14:30');
	});
});

describe('formatRelativeTime', () => {
	const now = new Date('2026-06-19T12:00:00Z');

	test('数分前を相対表記する', () => {
		const result = formatRelativeTime('2026-06-19T11:57:00Z', now, { locale: 'ja-JP' });

		expect(result).toContain('分');
		expect(result).toContain('前');
	});

	test('数日前を相対表記する', () => {
		const result = formatRelativeTime('2026-06-16T12:00:00Z', now, { locale: 'ja-JP' });

		expect(result).toContain('日');
		expect(result).toContain('前');
	});

	test('未来時刻は「後」方向で表記する', () => {
		const result = formatRelativeTime('2026-06-19T12:30:00Z', now, { locale: 'ja-JP' });

		expect(result).toContain('後');
	});
});
