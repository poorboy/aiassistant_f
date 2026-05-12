<script setup lang="ts">
import { useThemeStore } from "./stores/themeStore";

const theme = useThemeStore();
</script>

<template>
  <div class="app-layout" :class="{ dark: theme.isDark }">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>🤖 Blender AI</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" exact-active-class="active">
          <span class="nav-icon">💬</span>
          <span class="nav-label">聊天</span>
        </router-link>
        <router-link to="/mcp" class="nav-item" active-class="active">
          <span class="nav-icon">🔌</span>
          <span class="nav-label">AI 桥接服务</span>
        </router-link>
        <router-link to="/prompts" class="nav-item" active-class="active">
          <span class="nav-icon">📝</span>
          <span class="nav-label">角色管理</span>
        </router-link>
        <router-link to="/model-settings" class="nav-item" active-class="active">
          <span class="nav-icon">🧠</span>
          <span class="nav-label">模型配置</span>
        </router-link>
        <router-link to="/settings" class="nav-item" active-class="active">
          <span class="nav-icon">⚙️</span>
          <span class="nav-label">系统设置</span>
        </router-link>
        <router-link to="/help" class="nav-item" active-class="active">
          <span class="nav-icon">❓</span>
          <span class="nav-label">帮助</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <button class="theme-toggle" @click="theme.toggle()">
          {{ theme.isDark ? "☀️ 白天" : "🌙 夜间" }}
        </button>
      </div>
    </aside>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
:root {
  --bg: #f5f5f5;
  --sidebar-bg: #ffffff;
  --card-bg: #ffffff;
  --border: #e0e0e0;
  --text: #333333;
  --text-secondary: #666666;
  --primary: #1a73e8;
  --primary-hover: #1557b0;
  --input-bg: #ffffff;
  --hover-bg: #f0f0f0;
  --badge-bg: #e8f0fe;
}
[data-theme="dark"] {
  --bg: #1a1a2e;
  --sidebar-bg: #16213e;
  --card-bg: #1e2a45;
  --border: #2a3a5c;
  --text: #e0e0e0;
  --text-secondary: #a0a0b0;
  --primary: #4a9eff;
  --primary-hover: #3a8eef;
  --input-bg: #1e2a45;
  --hover-bg: #253a5a;
  --badge-bg: #1e3a5f;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  transition:
    background 0.3s,
    color 0.3s;
}
a {
  text-decoration: none;
  color: inherit;
}
button {
  cursor: pointer;
  font-family: inherit;
}
input,
select,
textarea {
  font-family: inherit;
}
</style>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition:
    background 0.3s,
    border-color 0.3s;
}
.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid var(--border);
}
.sidebar-header h2 {
  font-size: 16px;
}
.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  transition:
    background 0.2s,
    color 0.2s;
}
.nav-item:hover {
  background: var(--hover-bg);
  color: var(--text);
}
.nav-item.active {
  background: var(--primary);
  color: #fff;
}
.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}
.nav-label {
  font-size: 13px;
}
.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid var(--border);
}
.theme-toggle {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text);
  font-size: 13px;
  transition:
    background 0.2s,
    border-color 0.2s;
}
.theme-toggle:hover {
  background: var(--hover-bg);
}
.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg);
  transition: background 0.3s;
}
</style>
