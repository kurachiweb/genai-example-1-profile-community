// MailSender(Gateway)の実装。本番/dev(Cloudflare Workers)は Amazon SES(SESv2 REST API)へ送る。
// ローカル/dev(main.ts)は引き続き mail-sender.ts の NodemailerMailSender(Mailpit)を使う。
// @aws-sdk/client-ses(Node ランタイム向け)は Workers 実行時に
// `TypeError: emitWarningIfUnsupportedVersion$1 is not a function`(実機で確認済み、
// Node 専用のランタイム検知コードが esbuild バンドル後に解決できない)で起動時に落ちるため使わない。
// 代わりに Amazon Rekognition(00-overview.md §3)と同型の aws4fetch(fetch ベースの
// 軽量 SigV4 署名ライブラリ、Node 固有コード無し)で SESv2 の REST API を直接呼ぶ。
import { AwsClient } from 'aws4fetch';
import { Injectable } from '@nestjs/common';
import { MailMessage, MailSender } from '../application/admin/content-gateways';

export interface SesMailConfig {
	readonly from: string;
	readonly region: string;
	readonly accessKeyId: string;
	readonly secretAccessKey: string;
}

@Injectable()
export class SesMailSender implements MailSender {
	private readonly client: AwsClient;

	constructor(
		private readonly config: SesMailConfig,
		client?: AwsClient
	) {
		this.client =
			client ??
			new AwsClient({
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
				region: config.region,
				service: 'ses'
			});
	}

	async send(message: MailMessage): Promise<void> {
		const response = await this.client.fetch(
			`https://email.${this.config.region}.amazonaws.com/v2/email/outbound-emails`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					FromEmailAddress: this.config.from,
					Destination: { ToAddresses: [message.to] },
					Content: {
						Simple: {
							Subject: { Data: message.subject, Charset: 'UTF-8' },
							Body: { Html: { Data: message.html, Charset: 'UTF-8' } }
						}
					}
				})
			}
		);

		if (!response.ok) {
			const body = await response.text();
			throw new Error(`SES送信に失敗しました(status=${response.status}): ${body}`);
		}
	}
}
