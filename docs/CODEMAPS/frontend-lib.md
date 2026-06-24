# コードマップ — `apps/frontend-lib`（共通フロントエンド）

`client`／`admin` が再利用する共通フロントエンド資産（デザイントークン・ユーティリティ・プリミティブ）の構造マップ。
設計の正本は [docs/service/design/](../service/design/)、スタイリング規約は [GUIDES/coding/05-tailwind.md](../GUIDES/coding/05-tailwind.md)。

## 構成

```text
apps/frontend-lib/
├── styles/
│   ├── tokens.css          # デザイントークン(CSS変数二層: パレット→役割→ライト/ダーク。design/01)
│   └── global.css          # Tailwind v4 エントリ(@theme inline で役割トークン参照・base層・focus-visible)
├── utilities/              # フレームワーク非依存の純粋ユーティリティ(高カバレッジ)
│   ├── cn.ts               # clsx + tailwind-merge(coding/05 §2)
│   ├── grapheme.ts         # 書記素クラスタ計数(BR-COMMON-008)
│   ├── display-name.ts     # 表示名の決定論的組み立て(BR-PROF-003/004)・アイコン alt(design/04 §3)
│   ├── datetime.ts         # 閲覧者ローカルタイム整形・相対表記(BR-COMMON-015)
│   └── theme.ts            # テーマ解決(light/dark/system)・FOUC 防止スクリプト(design/01 §2.5)
├── components/
│   ├── ui/                 # shadcn/ui ベースのプリミティブ(Button/Badge/Card/Input/Label)+ Story
│   └── theme/              # ThemeProvider / useTheme(低頻度 Context)
├── .storybook/             # Storybook(React + Vite + Tailwind4・a11y アドオン)
├── index.ts                # 公開エントリ(client/admin は @app/frontend-lib から取り込む)
├── jest.config.ts          # Jest(ts-jest・ESM・jsdom)・RTL + jest-axe
└── eslint.config.ts        # apps/api 流用 + React/Hooks/jsx-a11y
```

## 設計上の要点

- **トークン二層構成**: 生パレット → 役割トークン（`--surface`/`--text`/`--accent` 等）。UI は役割トークンのみ参照。テーマは `.dark` で役割トークン値を差し替える（コンポーネントのクラスを分岐させない）。
- **パッケージ可搬性**: コンポーネント内部 import は相対パスにし、`@app/frontend-lib` として Next（`transpilePackages`）が TS ソースのままコンパイルできる。
- **色だけに依存しない**: 状態（Badge の tone 等）はアイコン＋テキスト併用を前提（design/01 §2.3・design/04 §4.2）。
- **再利用**: 表示名・書記素・ローカルタイムは client の公開ページ／一覧でも用いる共通ロジック。

## テスト

- ユーティリティ（cn/grapheme/display-name/datetime/theme）とプリミティブ（Button/Badge/Card/Input/Label）の単体・コンポーネントテスト（RTL + jest-axe）。`pnpm --filter @app/frontend-lib test`。
- コンポーネントカタログ: `pnpm --filter @app/frontend-lib storybook`（ライト/ダークトグル付き）。
