# AI Assistant フロントエンド

[**English**](../README.md) | [**中文**](README.zh.md)

Vue 3 ベースのフロントエンド。AI チャット（SSE ストリーミング）、MCP ブリッジ管理、マルチモデル構成、ロールプロンプト管理を提供します。

## デプロイ

### 前提条件
- Node.js 22+

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
