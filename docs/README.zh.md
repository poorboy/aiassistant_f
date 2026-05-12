# AI Assistant 前端

[**English**](../README.md) | [**日本語**](README.ja.md)

基于 Vue 3 的前端界面，提供 AI 聊天（SSE 流式）、MCP 桥接管理、多模型配置和角色提示词管理功能。

## 部署

### 环境要求
- Node.js 22+

### 安装与运行

```bash
cd web
npm install

# 开发模式（热重载，端口 42400）
npm run dev

# 生产构建（输出至 ../exe/static/）
npm run build
```

### API 地址

- 开发环境: `http://localhost:41400/api`（可通过 `VITE_API_BASE` 环境变量配置）
- 生产环境: 自动使用 `window.location.origin/api`
