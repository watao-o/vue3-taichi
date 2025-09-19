# Nuxt4 プロジェクト構成

```plaintext
📁 app/ # クライアント関係のコードを格納（Nuxt4 で導入）
├── 📁 assets/ # 画像・フォント・スタイルなど静的アセット
├── 📁 components/ # 再利用可能な UI コンポーネント（Atomic Design など）
│ ├── 📁 atoms/ # 最小単位（ボタン、入力欄、アイコンなど）
│ ├── 📁 molecules/ # atoms の組み合わせ（入力セルなど）
│ ├── 📁 organisms/ # molecules の組み合わせ（入力フォームなど）
│ └── 📁 templates/ # organisms をまとめたページ枠組み（お問い合わせフォームなど）
├── 📁 composables/ # Composition API で書かれた再利用可能ロジック
├── 📁 layouts/ # 共通レイアウト
├── 📁 middleware/ # ページ描画前に実行される関数
├── 📁 pages/ # 各ページ（ルーティング対応）
└── 📁 plugins/ # Vue プラグイン設定
📁 public/ # 公開される静的ファイル
📁 server/ # サーバーサイドの API や処理
📁 shared/ # クライアント & サーバー共通の utils や型定義
```
