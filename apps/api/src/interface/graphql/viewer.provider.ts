// 閲覧者(Viewer)の解決。本来は利用者の HTTPS-Only Cookie セッション(BR-COMMON-001)から復元する。
// セッションストア(KV)は後続ユニットの範囲のため、本ユニットでは開発用のスタンドインとして
// ヘッダ `x-user-id` を受け取り、UserRepository で状態を引いて Viewer を構成する。
// 認可・実効公開ゲートはユースケース層で評価するため、本プロバイダは「誰として実行するか」のみを担う。
import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../application/gateways';
import { Viewer } from '../../application/models';

export interface RequestLike {
	readonly headers?: Record<string, string | string[] | undefined>;
}

@Injectable()
export class ViewerProvider {
	constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

	async resolve(req: RequestLike | undefined): Promise<Viewer | null> {
		const header = req?.headers?.['x-user-id'];
		const userId = Array.isArray(header) ? header[0] : header;
		if (!userId) {
			return null;
		}
		const user = await this.users.findById(userId);
		return user ? { userId: user.id, status: user.status } : null;
	}
}
