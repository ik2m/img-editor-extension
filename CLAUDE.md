# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 関連ドキュメント

- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - コーディング規約とベストプラクティス

## プロジェクト概要

これはWXTフレームワークを使用したブラウザ拡張機能（Chrome/Firefox）で、画像編集機能を提供します。Vue 3とKonvaを使用して画像エディターを実装しています。

## 開発コマンド

### パッケージ管理
- **pnpmのみを使用**：このプロジェクトでは`pnpm`のみが許可されています（`preinstall`スクリプトで強制）
- インストール: `pnpm install`

### 開発サーバー
- Chrome開発: `pnpm dev`
- Firefox開発: `pnpm dev:firefox`

### ビルド
- Chrome用ビルド: `pnpm build`
- Firefox用ビルド: `pnpm build:firefox`
- ZIP作成: `pnpm zip` または `pnpm zip:firefox`

### 型チェック
- TypeScript型チェック: `pnpm compile`

### コードフォーマット
- コード自動フォーマット: `pnpm format`
- フォーマットチェック: `pnpm format:check`

## アーキテクチャ

### WXTフレームワーク構造

プロジェクトはWXTフレームワークのエントリーポイントベース構造を採用しています。`src/entrypoints/`配下の各ディレクトリとファイルが拡張機能の各部分を定義します：

#### エントリーポイント
- **popup/** - 拡張機能のポップアップUI
  - `index.html`, `App.vue`, `main.ts`
  - エディターを新規タブで開くランチャーとして機能

- **editor/** - メインの画像エディター画面
  - `index.html`, `App.vue`, `main.ts`
  - Konva + Vue Konvaを使用した画像編集UI
  - 新しいタブとして開かれる

- **background.ts** - バックグラウンドスクリプト
  - 現在は基本的なログ出力のみ

- **content.ts** - コンテンツスクリプト
  - `*://*.google.com/*`にマッチ
  - 現在は基本的なログ出力のみ

### 技術スタック

- **フレームワーク**: WXT (ブラウザ拡張開発フレームワーク)
- **UIフレームワーク**: Vue 3 (Composition API with `<script setup>`)
- **Canvas操作**: Konva + vue-konva
- **言語**: TypeScript
- **ビルドツール**: WXT (内部でViteを使用)

### 画像エディターの実装 (editor/App.vue)

#### 状態管理
- `imageUrl`: アップロードされた画像のDataURL
- `originalImage`: 元画像のHTMLImageElement
- `imageElement`: Konvaに渡す画像要素
- `rects`: 追加された矩形図形の配列（元画像座標系で保持）
- `selectedShapeId`: 現在選択中の図形ID
- `stageWidth/stageHeight`: Konvaステージの表示サイズ
- `layerScale`: レイヤー全体のスケール（リサイズ時に使用）

#### 主要機能
1. **画像アップロード** (`handleImageUpload`): FileReader APIで画像を読み込み
2. **リサイズ** (`resizeToMaxWidth840`): 画像をmax-width: 840pxにリサイズ（レイヤースケールで実現）
3. **矩形追加** (`addRectangle`): 元画像座標系で矩形を追加
4. **図形選択/変形** (`handleStageMouseDown`, `handleTransformEnd`, `updateTransformer`): Transformer APIで図形の選択と変形を実現

#### 座標系の扱い
- 図形は常に**元画像の座標系**で管理
- 表示時はレイヤー全体を`layerScale`でスケール
- これによりリサイズ後も正確な座標を保持

#### Konva階層構造
```
v-stage (width, height)
  └─ v-layer (scaleX, scaleY)
      ├─ v-rect (背景)
      ├─ v-image (画像本体)
      ├─ v-rect (ユーザー追加の矩形たち)
      └─ v-transformer (図形変形用)
```

### 注意事項

1. **Fabricからの移行**: 過去にFabric.jsを使用していましたが、現在はKonvaに置き換え済み
2. **npm禁止**: `package.json`の`preinstall`スクリプトで`pnpm`のみが許可されています
3. **WXTの自動生成**: `pnpm postinstall`で`.wxt/`ディレクトリに型定義が自動生成されます
4. **browser API**: WXTは`browser`グローバルオブジェクトを提供（WebExtensions API）

## 開発時の留意点

- エントリーポイントを追加する場合は`src/entrypoints/`配下に配置
- Vue Konvaコンポーネント（`v-stage`, `v-layer`, `v-image`, `v-rect`, `v-transformer`等）を使用
- 図形の座標は元画像座標系で管理し、表示スケールはレイヤーレベルで適用
- TypeScript型チェックは`pnpm compile`で実行（ビルドには含まれない）
