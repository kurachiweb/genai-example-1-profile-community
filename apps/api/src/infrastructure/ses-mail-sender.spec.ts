// SesMailSender の単体テスト(TDD: RED → GREEN)。
// 本番/dev(Cloudflare Workers)でのメール送信を Amazon SES(SendEmail API)へ委譲する実装を検証する。
// 実際の AWS 呼び出しは行わず、SESClient をフェイク化する(gateway 境界でのフェイク化、testing/01-unit-integration.md)。
import type { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { SesMailSender } from './ses-mail-sender';

class RecordingSesClient {
	readonly commands: SendEmailCommand[] = [];

	async send(command: SendEmailCommand): Promise<Record<string, never>> {
		this.commands.push(command);
		return {};
	}
}

class ThrowingSesClient {
	async send(): Promise<never> {
		throw new Error('SES送信に失敗しました(テスト用)');
	}
}

const CONFIG = {
	from: 'no-reply@example.com',
	region: 'eu-west-1',
	accessKeyId: 'AKIATEST',
	secretAccessKey: 'test-secret'
};

describe('SesMailSender', () => {
	it('SendEmailCommand で To/Subject/Html/Source を正しく組み立てて送信する', async () => {
		const client = new RecordingSesClient();
		const sender = new SesMailSender(CONFIG, client as unknown as SESClient);

		await sender.send({
			to: 'user@example.com',
			subject: '確認メール',
			html: '<p>本文</p>'
		});

		expect(client.commands).toHaveLength(1);
		expect(client.commands[0].input).toEqual({
			Source: 'no-reply@example.com',
			Destination: { ToAddresses: ['user@example.com'] },
			Message: {
				Subject: { Data: '確認メール', Charset: 'UTF-8' },
				Body: { Html: { Data: '<p>本文</p>', Charset: 'UTF-8' } }
			}
		});
	});

	it('SES 呼び出しが失敗した場合は例外を呼び出し元に伝播する(握りつぶさない)', async () => {
		const sender = new SesMailSender(CONFIG, new ThrowingSesClient() as unknown as SESClient);

		await expect(
			sender.send({ to: 'user@example.com', subject: '件名', html: '<p>本文</p>' })
		).rejects.toThrow('SES送信に失敗しました(テスト用)');
	});
});
