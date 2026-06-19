// 条件付き Tailwind クラスを安全に合成するユーティリティ（shadcn/ui 慣例）。
// clsx で条件を解決し、tailwind-merge で重複・衝突するユーティリティをマージする
// （coding/05-tailwind.md §2。文字列連結でクラスを組み立てない）。
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
