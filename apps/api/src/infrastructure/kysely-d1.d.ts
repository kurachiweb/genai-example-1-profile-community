// kysely-d1 は package.json の "exports" に "types" 条件が無く、moduleResolution: "nodenext"
// では型解決に失敗する(パッケージ側の既知の不備)。実体の型定義を re-export して型解決のみ補う。
// tsconfig の "paths" でモジュール自体を .d.ts へ差し替えると、ts-node/tsconfig-paths が
// 実行時にも同じ差し替えを適用してしまい、node_modules 配下の .d.ts を直接 require しようとして
// 失敗する(Node の型ストリッピングは node_modules 配下非対応)ため、ambient 宣言のみで補う。
declare module 'kysely-d1' {
	export type { D1DialectConfig } from '../../node_modules/kysely-d1/dist/index';
	export { D1Dialect } from '../../node_modules/kysely-d1/dist/index';
}
