// 利用者セッションの定数。BR-COMMON-001 に基づく 30 日スライディング方式。
export const USER_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 日

// next/headers に依存しない純粋な定数のため、Client Component からも安全に import できる。
// session.ts(next/headers 使用)に置くとバンドラがクライアントバンドルへ巻き込んでしまうため分離する。
const isProduction = process.env.NODE_ENV === 'production';
// 本番は __Host- プレフィックス(Secure・path=/・domain 無し必須)。ローカル(http)は通常名。
export const SESSION_COOKIE = isProduction ? '__Host-user_session' : 'user_session';
