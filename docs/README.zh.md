# AI Assistant 前端

[**English**](../README.md) | [**日本語**](README.ja.md)

AI Assistant 应用的前端界面。基于 Vue 3，提供直观的 AI 聊天界面、MCP 桥接管理、多模型配置和角色提示词管理功能。

> **后端仓库**: [github.com/poorboy/aiassistant_s](https://github.com/poorboy/aiassistant_s)

## 功能

- **聊天** (`/`): 会话管理、SSE 流式 AI 聊天（实时显示工具调用），每条会话可选模型和角色提示词。
- **AI 桥接服务** (`/mcp`): 监控 Blender/GIMP MCP 连接状态，启动/停止进程，实时查看日志。
- **模型设置** (`/model-settings`): 多供应商模型配置增删改查。18 个常见模型预设一键填充。每个模型可独立设置代理地址。测试连接功能。
- **角色管理** (`/prompts`): 系统角色提示词 CRUD，按分类分组（自定义/系统/Blender/GIMP）。
- **系统设置** (`/settings`): 传统单模型设置、Blender 工作目录。
- **帮助** (`/help`): Blender MCP、GIMP MCP 使用指南和 Agent 指令参考。
- **暗色/亮色主题**: 一键切换，状态持久化到 localStorage。

## 部署

### 环境要求
- Node.js 22+
- 需要 [后端服务](https://github.com/poorboy/aiassistant_s) 运行在 41400 端口

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

### 与后端一起部署

同时克隆前后端仓库，构建后将前端产物放入后端 `exe/static/` 目录即可独立运行：

```bash
# 构建后端
cd gosrc && go build -o ../exe/aiass.exe .

# 构建前端到后端静态目录
cd web && npm run build   # 输出至 ../exe/static/

# 运行
cd exe && ./aiass.exe
```
