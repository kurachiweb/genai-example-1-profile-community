// MailSender(Gateway)の実装。ローカル/dev は SMTP(Mailpit)へ送る。
// 本番は Amazon SES(@aws-sdk/client-ses)へ差し替える(MailSender 実装の差し替え)。
// Mailpit の SMTP はサービス間ポート(1025)で、api コンテナから host 'mailpit' に到達する(compose.yaml)。
import nodemailer, { type Transporter } from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { MailMessage, MailSender } from '../application/admin/content-gateways';

export interface MailConfig {
	readonly host: string;
	readonly port: number;
	readonly from: string;
}

@Injectable()
export class NodemailerMailSender implements MailSender {
	private readonly transporter: Transporter;

	constructor(private readonly config: MailConfig) {
		this.transporter = nodemailer.createTransport({
			host: config.host,
			port: config.port,
			secure: false
		});
	}

	async send(message: MailMessage): Promise<void> {
		await this.transporter.sendMail({
			from: this.config.from,
			to: message.to,
			subject: message.subject,
			html: message.html
		});
	}
}
