import { reportReasonLabel, snsLinkPlatformLabel } from './labels';

describe('snsLinkPlatformLabel', () => {
	it('既知のプラットフォームを日本語ラベルに変換する', () => {
		expect(snsLinkPlatformLabel('x')).toBe('X (旧 Twitter)');
		expect(snsLinkPlatformLabel('github')).toBe('GitHub');
		expect(snsLinkPlatformLabel('instagram')).toBe('Instagram');
		expect(snsLinkPlatformLabel('website')).toBe('Web サイト');
	});

	it('未知のプラットフォームはそのまま返す', () => {
		// @ts-expect-error 意図的に未知の値を渡す
		expect(snsLinkPlatformLabel('UNKNOWN')).toBe('UNKNOWN');
	});
});

describe('reportReasonLabel', () => {
	it('既知の通報理由を日本語ラベルに変換する', () => {
		expect(reportReasonLabel('SPAM')).toBe('スパム');
		expect(reportReasonLabel('INAPPROPRIATE_IMAGE')).toBe('不適切なコンテンツ');
		expect(reportReasonLabel('HARASSMENT')).toBe('嫌がらせ・ハラスメント');
		expect(reportReasonLabel('IMPERSONATION')).toBe('なりすまし');
		expect(reportReasonLabel('OTHER')).toBe('その他');
	});

	it('未知のカテゴリはそのまま返す', () => {
		expect(reportReasonLabel('CUSTOM')).toBe('CUSTOM');
	});
});
