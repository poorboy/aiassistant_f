# AI Assistant Frontend

[**中文**](docs/README.zh.md) | [**日本語**](docs/README.ja.md)

A Vue 3 frontend for AI chat with SSE streaming, MCP bridge management, multi-model configuration, and role prompt management.

## Deployment

### Prerequisites
- Node.js 22+

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
