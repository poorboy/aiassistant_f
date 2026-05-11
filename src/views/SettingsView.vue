<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useSettingsStore } from "../stores/settingsStore";
import {
  getSettings,
  updateSettings,
  testDeepSeek,
} from "../api";

const settingsStore = useSettingsStore();
const activeTab = ref("model");

const apiKey = ref("");
const baseUrl = ref("");
const model = ref("");
const testResult = ref("");
const workDir = ref("");

onMounted(async () => {
  try {
    const res = await getSettings();
    settingsStore.setAll(res.data);
    apiKey.value = res.data["deepseek.api_key"] || "";
    baseUrl.value = res.data["deepseek.base_url"] || "https://api.deepseek.com";
    model.value = res.data["deepseek.model"] || "deepseek-v4-flash";
    workDir.value = res.data["blender.work_dir"] || "";
  } catch {
    // ignore
  }
});

async function saveSettings() {
  await updateSettings({
    "deepseek.api_key": apiKey.value,
    "deepseek.base_url": baseUrl.value,
    "deepseek.model": model.value,
    "blender.work_dir": workDir.value,
  });
  settingsStore.setAll({
    "deepseek.api_key": apiKey.value,
    "deepseek.base_url": baseUrl.value,
    "deepseek.model": model.value,
    "blender.work_dir": workDir.value,
  });
  alert("设置已保存");
}

async function testConn() {
  try {
    await testDeepSeek();
    testResult.value = "✅ 连接成功";
  } catch (e: any) {
    testResult.value = "❌ 连接失败: " + (e?.message || "");
  }
}
</script>

<template>
  <div class="settings-page">
    <header><h1>⚙️ 系统设置</h1></header>

    <div class="tab-bar">
      <button
        :class="['tab', { active: activeTab === 'model' }]"
        @click="activeTab = 'model'"
      >
        🤖 模型设置
      </button>
      <button
        :class="['tab', { active: activeTab === 'other' }]"
        @click="activeTab = 'other'"
      >
        📁 其他
      </button>
    </div>

    <div v-show="activeTab === 'model'" class="tab-content">
      <div class="section">
        <div class="field">
          <label>API Key</label>
          <input v-model="apiKey" type="password" placeholder="sk-..." />
        </div>
        <div class="field">
          <label>Base URL</label>
          <input v-model="baseUrl" placeholder="https://api.deepseek.com" />
        </div>
        <div class="field">
          <label>Model</label>
          <input v-model="model" placeholder="deepseek-v4-flash" />
        </div>
        <div class="actions">
          <button @click="testConn">测试连接</button>
          <button @click="saveSettings">保存设置</button>
        </div>
        <div v-if="testResult" class="test-result">{{ testResult }}</div>
      </div>
    </div>

    <div v-show="activeTab === 'other'" class="tab-content">
      <div class="section">
        <div class="field">
          <label>Blender 工作目录</label>
          <input
            v-model="workDir"
            placeholder="C:/Blender/projects 或 /home/user/blender_output"
          />
        </div>
        <div class="help-text">
          <p>Blender 生成的文件（渲染图、导出模型等）保存到此目录。</p>
        </div>
        <div class="actions">
          <button @click="saveSettings">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  padding: 24px 32px;
}
header {
  margin-bottom: 16px;
}
.tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--border, #e0e0e0);
  margin-bottom: 20px;
}
.tab {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary, #666);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition:
    color 0.2s,
    border-color 0.2s;
}
.tab:hover {
  color: var(--text, #333);
}
.tab.active {
  color: var(--primary, #1a73e8);
  border-bottom-color: var(--primary, #1a73e8);
  font-weight: 600;
}
.section {
  padding: 16px;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 8px;
  background: var(--card-bg, #fff);
}
.field {
  margin-bottom: 14px;
}
.field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text, #333);
}
.field input,
.field select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border, #ddd);
  border-radius: 6px;
  background: var(--input-bg, #fff);
  color: var(--text, #333);
}
.help-text {
  margin-top: 10px;
  padding: 8px;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-secondary, #666);
}
.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.actions button {
  padding: 8px 20px;
  background: var(--primary, #1a73e8);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.test-result {
  margin-top: 8px;
  font-size: 13px;
}
.conn-item {
  padding: 12px;
  border: 1px solid var(--border, #eee);
  border-radius: 6px;
  margin-bottom: 8px;
}
.conn-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}
.status-badge.connected {
  color: #34a853;
}
.status-badge.disconnected {
  color: #999;
}
.conn-detail {
  font-size: 12px;
  color: var(--text-secondary, #666);
  margin-bottom: 6px;
}
.conn-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.conn-actions button {
  font-size: 12px;
  padding: 4px 10px;
  border: 1px solid var(--border, #ddd);
  border-radius: 4px;
  background: var(--input-bg, #fff);
  color: var(--text, #333);
  cursor: pointer;
}
.conn-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.mcp-hint {
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--text-secondary, #666);
}
.tools-list {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.tool-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: var(--hover-bg, #f0f0f0);
  border-radius: 4px;
  color: var(--text-secondary, #555);
}
</style>
