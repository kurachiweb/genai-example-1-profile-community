// フロントエンド共通ライブラリの公開エントリ。client / admin から再利用する。
// スタイル（tokens.css / global.css）は CSS として各アプリのエントリで読み込む。

// ユーティリティ
export { cn } from './utilities/cn';
export { countGraphemes, withinGraphemeLimit } from './utilities/grapheme';
export {
	buildDisplayName,
	profileIconAlt,
	type NameDisplayOrder,
	type DisplayNameInput
} from './utilities/display-name';
export {
	formatDate,
	formatDateTime,
	formatRelativeTime,
	type DateInput,
	type FormatOptions
} from './utilities/datetime';
export {
	getThemeInitScript,
	isTheme,
	resolveTheme,
	THEME_STORAGE_KEY,
	type ResolvedTheme,
	type Theme
} from './utilities/theme';

// コンポーネント（プリミティブ）
export { Button, buttonVariants, type ButtonProps } from './components/ui/button';
export { Badge, badgeVariants, type BadgeProps } from './components/ui/badge';
export {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	cardVariants,
	type CardProps,
	type CardTitleProps
} from './components/ui/card';
export { Input, type InputProps } from './components/ui/input';
export { Label, type LabelProps } from './components/ui/label';

// テーマ
export { ThemeProvider, useTheme } from './components/theme/theme-provider';
