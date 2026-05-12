# AI Assistant Frontend

[**中文**](docs/README.zh.md) | [**日本語**](docs/README.ja.md)

Vue 3 frontend for the AI Assistant application. Provides an intuitive chat interface with SSE streaming, MCP bridge management, multi-model configuration, and role prompt management.

> **Backend repository**: [github.com/poorboy/aiassistant_s](https://github.com/poorboy/aiassistant_s)

## Features

- **Chat** (`/`): Conversation management, SSE streaming AI chat with real-time tool call display. Select model and role prompt per conversation.
- **MCP Bridge** (`/mcp`): Monitor Blender/GIMP MCP connection status, start/stop processes, view real-time logs.
- **Model Settings** (`/model-settings`): Add/edit/delete model configs for different providers. 18 common presets with quick-fill. Per-model proxy settings. Test connection.
- **Role Management** (`/prompts`): CRUD for system role prompts, grouped by category (custom/system/Blender/GIMP).
- **System Settings** (`/settings`): Legacy single-model settings, Blender working directory.
- **Help** (`/help`): Usage guides for Blender MCP, GIMP MCP, and agent commands.
- **Dark/Light Theme**: Toggle with persistence to localStorage.

## Deployment

### Prerequisites
- Node.js 22+
- Requires the [backend service](https://github.com/poorboy/aiassistant_s) running on port 41400

### Install & Run

```bash
cd web
npm install

# Development (hot reload, port 42400)
npm run dev

# Production build (output to ../exe/static/)
npm run build
```

### API Base URL

- Development: `http://localhost:41400/api` (configurable via `VITE_API_BASE` env)
- Production: auto-detected from `window.location.origin/api`

### Deploy with Backend

Clone and build both repos, then place the frontend build output (`exe/static/`) alongside the backend binary for a standalone deployment:

```bash
# Build backend
cd gosrc && go build -o ../exe/aiass.exe .

# Build frontend into backend's static directory
cd web && npm run build   # outputs to ../exe/static/

# Run
cd exe && ./aiass.exe
```
