// Valkey(Redis 互換)への接続生成。本番は Cloudflare KV へ差し替わる、ローカル/自前ホスティング向けの実装。
// モジュール間でプロバイダを共有しない既存方針(user.module.ts の MAIL_CONFIG 参照)に倣い、
// 利用側モジュールごとにクライアントを生成する(各 module.ts のファクトリから呼び出す)。
//
// ioredis(本番接続)/ioredis-mock(テスト用フェイク)を同一の形で扱うため、実際に使うコマンドのみを
// 抜き出した最小インターフェースを自前で定義する(ioredis の複雑なオーバーロード型に依存しない)。
import Redis from 'ioredis';

export interface ValkeyClient {
	get(key: string): Promise<string | null>;
	set(key: string, value: string, mode: 'EX', seconds: number): Promise<'OK' | null>;
	del(key: string): Promise<number>;
	expire(key: string, seconds: number): Promise<number>;
	/** 取得と同時に削除する(ワンタイム値の消費に使う)。 */
	getdel(key: string): Promise<string | null>;
	quit(): Promise<'OK'>;
}

export function createValkeyClient(url: string): ValkeyClient {
	// テスト実行時にソケットを開かせないため lazyConnect にする(初回コマンド発行時に接続)。
	return new Redis(url, { lazyConnect: true });
}
