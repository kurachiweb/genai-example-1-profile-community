// グローバル CSS(非 module)の side-effect import 用アンビエント宣言。
// next/types/global.d.ts は *.module.css のみ宣言するため、app/layout.tsx の
// `import './globals.css'` を型チェックできるよう別途宣言する。
declare module '*.css';
