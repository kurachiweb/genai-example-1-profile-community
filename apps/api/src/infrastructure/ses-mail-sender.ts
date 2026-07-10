// MailSender(Gateway)の実装。本番/dev(Cloudflare Workers)は Amazon SES(SendEmail API)へ送る。
// ローカル/dev(main.ts)は引き続き mail-sender.ts の NodemailerMailSender(Mailpit)を使う。
// Workers はデフォルトの認証情報プロバイダチェーン(~/.aws/credentials 等のファイル探索)を実行できず、
// Node ネイティブの http/https エージェントも持たないため、region/credentials を明示指定し、
// requestHandler も fetch ベースの FetchHttpHandler へ差し替える(Workers 互換)。
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { FetchHttpHandler } from '@smithy/fetch-http-handler';
import { Injectable } from '@nestjs/common';
import { MailMessage, MailSender } from '../application/admin/content-gateways';

export interface SesMailConfig {
	readonly from: string;
	readonly region: string;
	readonly accessKeyId: string;
	readonly secretAccessKey: string;
}

const CHARSET = 'UTF-8';

function createClient(config: SesMailConfig): SESClient {
	return new SESClient({
		region: config.region,
		credentials: {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey
		},
		requestHandler: new FetchHttpHandler()
	});
}

@Injectable()
export class SesMailSender implements MailSender {
	private readonly client: SESClient;

	constructor(
		private readonly config: SesMailConfig,
		client: SESClient = createClient(config)
	) {
		this.client = client;
	}

	async send(message: MailMessage): Promise<void> {
		await this.client.send(
			new SendEmailCommand({
				Source: this.config.from,
				Destination: { ToAddresses: [message.to] },
				Message: {
					Subject: { Data: message.subject, Charset: CHARSET },
					Body: { Html: { Data: message.html, Charset: CHARSET } }
				}
			})
		);
	}
}
