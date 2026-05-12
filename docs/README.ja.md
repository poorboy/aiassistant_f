# AI Assistant フロントエンド

[**English**](../README.md) | [**中文**](README.zh.md)

AI Assistant アプリケーションのフロントエンド。Vue 3 ベースで、直感的な AI チャットインターフェース、MCP ブリッジ管理、マルチモデル構成、ロールプロンプト管理を提供します。

> **バックエンドリポジトリ**: [github.com/poorboy/aiassistant_s](https://github.com/poorboy/aiassistant_s)

## 機能

- **チャット** (`/`): 会話管理、SSE ストリーミング AI チャット（ツール呼び出しをリアルタイム表示）。会話ごとにモデルとロールプロンプトを選択可能。
- **MCP ブリッジ** (`/mcp`): Blender/GIMP の MCP 接続状態監視、プロセス開始/停止、リアルタイムログ表示。
- **モデル設定** (`/model-settings`): 複数プロバイダーのモデル設定を追加/編集/削除。18 のプリセットをワンクリック入力。モデルごとにプロキシ設定可能。接続テスト機能。
- **ロール管理** (`/prompts`): システムロールプロンプトの CRUD。カテゴリ別にグループ化（カスタム/システム/Blender/GIMP）。
- **システム設定** (`/settings`): 従来の単一モデル設定、Blender 作業ディレクトリ。
- **ヘルプ** (`/help`): Blender MCP、GIMP MCP の使用方法とエージェントコマンドリファレンス。
- **ダーク/ライトテーマ**: ワンクリック切替、localStorage に保存。

## デプロイ

### 前提条件
- Node.js 22+
- [バックエンドサービス](https://github.com/poorboy/aiassistant_s) がポート 41400 で動作している必要があります

### インストールと実行

```bash
cd web
npm install

# 開発モード（ホットリロード、ポート 42400）
npm run dev

# プロダクションビルド（出力先: ../exe/static/）
npm run build
```

### API ベース URL

- 開発環境: `http://localhost:41400/api`（環境変数 `VITE_API_BASE` で設定可能）
- 本番環境: `window.location.origin/api` を自動検出

### バックエンドと一緒にデプロイ

両方のリポジトリをクローンしてビルドし、フロントエンドのビルド成果物をバックエンドの静的ディレクトリに配置：

```bash
# バックエンドのビルド
cd gosrc && go build -o ../exe/aiass.exe .

# フロントエンドをバックエンドの静的ディレクトリにビルド
cd web && npm run build   # ../exe/static/ に出力

# 実行
cd exe && ./aiass.exe
```
