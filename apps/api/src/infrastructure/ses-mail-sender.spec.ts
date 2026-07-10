// SesMailSender の単体テスト(TDD: RED → GREEN)。
// 本番/dev(Cloudflare Workers)でのメール送信を Amazon SES(SESv2 REST API、aws4fetch 経由)へ
// 委譲する実装を検証する。実際の AWS 呼び出しは行わず、AwsClient をフェイク化する
// (gateway 境界でのフェイク化、testing/01-unit-integration.md)。
import type { AwsClient } from 'aws4fetch';
import { SesMailSender } from './ses-mail-sender';

class RecordingAwsClient {
	readonly requests: { url: string; init: RequestInit }[] = [];

	async fetch(url: string, init: RequestInit): Promise<Response> {
		this.requests.push({ url, init });
		return new Response(JSON.stringify({ MessageId: 'test-message-id' }), { status: 200 });
	}
}

class FailingAwsClient {
	async fetch(): Promise<Response> {
		return new Response('メールアドレスが検証されていません(テスト用)', { status: 400 });
	}
}

const CONFIG = {
	from: 'no-reply@example.com',
	region: 'eu-west-1',
	accessKeyId: 'AKIATEST',
	secretAccessKey: 'test-secret'
};

describe('SesMailSender', () => {
	it('SESv2 の SendEmail REST API へ To/Subject/Html/Source を正しく組み立てて送信する', async () => {
		const client = new RecordingAwsClient();
		const sender = new SesMailSender(CONFIG, client as unknown as AwsClient);

		await sender.send({
			to: 'user@example.com',
			subject: '確認メール',
			html: '<p>本文</p>'
		});

		expect(client.requests).toHaveLength(1);
		const { url, init } = client.requests[0];
		expect(url).toBe('https://email.eu-west-1.amazonaws.com/v2/email/outbound-emails');
		expect(init.method).toBe('POST');
		expect(JSON.parse(init.body as string)).toEqual({
			FromEmailAddress: 'no-reply@example.com',
			Destination: { ToAddresses: ['user@example.com'] },
			Content: {
				Simple: {
					Subject: { Data: '確認メール', Charset: 'UTF-8' },
					Body: { Html: { Data: '<p>本文</p>', Charset: 'UTF-8' } }
				}
			}
		});
	});

	it('SES 呼び出しが失敗した場合(非 2xx)は例外を呼び出し元に伝播する(握りつぶさない)', async () => {
		const sender = new SesMailSender(CONFIG, new FailingAwsClient() as unknown as AwsClient);

		await expect(
			sender.send({ to: 'user@example.com', subject: '件名', html: '<p>本文</p>' })
		).rejects.toThrow('メールアドレスが検証されていません(テスト用)');
	});
});
