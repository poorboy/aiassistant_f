<script setup lang="ts">
import { ref } from "vue";
import { useThemeStore } from "./stores/themeStore";
import { useI18nStore } from "./stores/i18nStore";

const theme = useThemeStore();
const i18n = useI18nStore();
const collapsed = ref(false);
const localeOpen = ref(false);

const locales = [
  { value: 'en', label: 'EN' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
]

function setLocale(l: string) {
  i18n.setLocale(l)
  localeOpen.value = false
}
</script>

<template>
  <div class="app-layout" :class="{ dark: theme.isDark }">
    <aside class="sidebar" :class="{ collapsed }">
      <div class="sidebar-header" @click="collapsed = !collapsed">
        <h2>{{ collapsed ? '🤖' : i18n.t('appTitle') }}</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" exact-active-class="active">
          <span class="nav-icon">💬</span>
          <span v-if="!collapsed" class="nav-label">{{ i18n.t('navChat') }}</span>
        </router-link>
        <router-link to="/mcp" class="nav-item" active-class="active">
          <span class="nav-icon">🔌</span>
          <span v-if="!collapsed" class="nav-label">{{ i18n.t('navMCP') }}</span>
        </router-link>
        <router-link to="/prompts" class="nav-item" active-class="active">
          <span class="nav-icon">📝</span>
          <span v-if="!collapsed" class="nav-label">{{ i18n.t('navPrompts') }}</span>
        </router-link>
        <router-link to="/user-prompts" class="nav-item" active-class="active">
          <span class="nav-icon">📋</span>
          <span v-if="!collapsed" class="nav-label">{{ i18n.t('navUserPrompts') }}</span>
        </router-link>
        <router-link to="/model-settings" class="nav-item" active-class="active">
          <span class="nav-icon">🧠</span>
          <span v-if="!collapsed" class="nav-label">{{ i18n.t('navModelSettings') }}</span>
        </router-link>
        <router-link to="/settings" class="nav-item" active-class="active">
          <span class="nav-icon">⚙️</span>
          <span v-if="!collapsed" class="nav-label">{{ i18n.t('navSettings') }}</span>
        </router-link>
        <router-link to="/help" class="nav-item" active-class="active">
          <span class="nav-icon">❓</span>
          <span v-if="!collapsed" class="nav-label">{{ i18n.t('navHelp') }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="footer-row">
          <button class="footer-btn" @click="theme.toggle()" :title="theme.isDark ? i18n.t('themeLight') : i18n.t('themeDark')">
            {{ theme.isDark ? '☀️' : '🌙' }}
          </button>
          <div v-if="!collapsed" class="locale-wrap">
            <button class="footer-btn" @click="localeOpen = !localeOpen">🌐</button>
            <div v-if="localeOpen" class="locale-popup">
              <button v-for="l in locales" :key="l.value" :class="['locale-opt', { active: i18n.locale === l.value }]" @click="setLocale(l.value)">{{ l.label }}</button>
            </div>
          </div>
          <button class="footer-btn collapse-btn" @click="collapsed = !collapsed" :title="collapsed ? 'Expand' : 'Collapse'">{{ collapsed ? '▶' : '◀' }}</button>
        </div>
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
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sidebar-header h2 {
  font-size: 16px;
}
.locale-select {
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text);
  font-size: 12px;
  cursor: pointer;
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
.footer-row {
  display: flex;
  gap: 6px;
  justify-content: center;
}
.footer-btn {
  width: 44px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, border-color 0.2s;
}
.footer-btn:hover {
  background: var(--hover-bg);
}
.locale-wrap {
  position: relative;
}
.locale-popup {
  position: absolute;
  bottom: 44px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
}
.locale-opt {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}
.locale-opt:hover {
  background: var(--hover-bg);
}
.locale-opt.active {
  background: var(--primary);
  color: #fff;
}
.collapse-btn {
  font-size: 14px;
}
.sidebar.collapsed {
  width: 68px;
  min-width: 68px;
}
.sidebar.collapsed .sidebar-header {
  cursor: pointer;
  padding: 20px 8px;
  align-items: center;
}
.sidebar.collapsed .sidebar-header h2 {
  font-size: 22px;
  text-align: center;
  width: 100%;
}
.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 10px 4px;
}
.sidebar.collapsed .nav-icon {
  width: auto;
  font-size: 22px;
}
.sidebar.collapsed .sidebar-footer {
  padding: 12px 4px;
}
.sidebar.collapsed .footer-row {
  flex-direction: column;
  align-items: center;
}
.sidebar.collapsed .collapse-btn {
  font-size: 14px;
}
.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg);
  transition: background 0.3s;
}
</style>
