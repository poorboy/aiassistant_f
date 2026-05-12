<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  listModelConfigs,
  createModelConfig,
  updateModelConfig,
  deleteModelConfig,
  setActiveModelConfig,
  testModelConfig,
  getSettings,
  updateSettings,
  testDeepSeek,
} from "../api";
import { useSettingsStore } from "../stores/settingsStore";

const settingsStore = useSettingsStore();
const modelConfigs = ref<any[]>([]);
const editingId = ref("");
const showForm = ref(false);
const formData = ref({ provider: "", name: "", model: "", base_url: "", api_key: "", proxy_url: "" });
const testResult = ref("");
const legacyApiKey = ref("");
const legacyBaseUrl = ref("");
const legacyModel = ref("");
const legacyTestResult = ref("");

onMounted(async () => {
  await loadData();
});

async function loadData() {
  try {
    const res = await listModelConfigs();
    modelConfigs.value = Array.isArray(res.data) ? res.data : [];
  } catch {}
  try {
    const res = await getSettings();
    settingsStore.setAll(res.data);
    legacyApiKey.value = res.data["deepseek.api_key"] || "";
    legacyBaseUrl.value = res.data["deepseek.base_url"] || "https://api.deepseek.com";
    legacyModel.value = res.data["deepseek.model"] || "deepseek-v4-flash";
  } catch {}
}

async function saveLegacySettings() {
  await updateSettings({
    "deepseek.api_key": legacyApiKey.value,
    "deepseek.base_url": legacyBaseUrl.value,
    "deepseek.model": legacyModel.value,
  });
  settingsStore.setAll({
    "deepseek.api_key": legacyApiKey.value,
    "deepseek.base_url": legacyBaseUrl.value,
    "deepseek.model": legacyModel.value,
  });
  alert("传统设置已保存");
}

async function testLegacy() {
  try {
    await testDeepSeek();
    legacyTestResult.value = "✅ 连接成功";
  } catch (e: any) {
    legacyTestResult.value = "❌ 连接失败: " + (e?.response?.data?.message || e?.message || "");
  }
}

function openNewForm() {
  showForm.value = true;
  editingId.value = "";
  formData.value = { provider: "", name: "", model: "", base_url: "", api_key: "", proxy_url: "" };
}

function openEdit(item: any) {
  showForm.value = true;
  editingId.value = item.id;
  formData.value = {
    provider: item.provider || "",
    name: item.name || "",
    model: item.model || "",
    base_url: item.base_url || "",
    api_key: item.api_key || "",
    proxy_url: item.proxy_url || "",
  };
}

async function saveForm() {
  if (!formData.value.provider || !formData.value.name || !formData.value.model) {
    alert("供应商、名称、模型为必填项");
    return;
  }
  try {
    if (editingId.value) {
      await updateModelConfig(editingId.value, formData.value);
    } else {
      await createModelConfig(formData.value);
    }
    showForm.value = false;
    await loadData();
  } catch (e: any) {
    alert("保存失败: " + (e?.response?.data?.error || e?.message || ""));
  }
}

async function removeItem(id: string) {
  if (!confirm("确认删除此模型配置？")) return;
  try {
    await deleteModelConfig(id);
    await loadData();
  } catch {}
}

async function setActive(id: string) {
  try {
    await setActiveModelConfig(id);
    await loadData();
  } catch {}
}

async function testModel(id: string) {
  testResult.value = "测试中...";
  try {
    const res = await testModelConfig(id);
    testResult.value = res.data.status === "ok" ? "✅ 连接成功" : "❌ 失败: " + res.data.message;
  } catch (e: any) {
    testResult.value = "❌ 错误: " + (e?.response?.data?.message || e?.message || "");
  }
}

const groupedConfigs = computed(() => {
  const groups: Record<string, any[]> = {};
  for (const m of modelConfigs.value) {
    const p = m.provider || "未分类";
    if (!groups[p]) groups[p] = [];
    groups[p].push(m);
  }
  return groups;
});

const presets = [
  { label: "DeepSeek Chat", provider: "DeepSeek", name: "DeepSeek Chat", model: "deepseek-chat", base_url: "https://api.deepseek.com" },
  { label: "DeepSeek V3 (SiliconFlow)", provider: "SiliconFlow", name: "DeepSeek V3", model: "Pro/deepseek-ai/DeepSeek-V3", base_url: "https://api.siliconflow.cn/v1" },
  { label: "GPT-4o", provider: "OpenAI", name: "GPT-4o", model: "gpt-4o", base_url: "https://api.openai.com" },
  { label: "GPT-4o Mini", provider: "OpenAI", name: "GPT-4o Mini", model: "gpt-4o-mini", base_url: "https://api.openai.com" },
  { label: "Claude Sonnet", provider: "Anthropic", name: "Claude Sonnet", model: "claude-sonnet-4-20250514", base_url: "https://api.anthropic.com" },
  { label: "Claude Haiku", provider: "Anthropic", name: "Claude Haiku", model: "claude-haiku-3-5-20250101", base_url: "https://api.anthropic.com" },
  { label: "Gemini 2.5 Pro", provider: "Google", name: "Gemini 2.5 Pro", model: "gemini-2.5-pro", base_url: "https://generativelanguage.googleapis.com" },
  { label: "Gemini 2.5 Flash", provider: "Google", name: "Gemini 2.5 Flash", model: "gemini-2.5-flash", base_url: "https://generativelanguage.googleapis.com" },
  { label: "Moonshot v1", provider: "Moonshot", name: "Moonshot v1", model: "moonshot-v1-8k", base_url: "https://api.moonshot.cn" },
  { label: "GLM-4-Plus", provider: "智谱", name: "GLM-4-Plus", model: "glm-4-plus", base_url: "https://open.bigmodel.cn/api/paas/v4" },
  { label: "Qwen Max", provider: "阿里云", name: "Qwen Max", model: "qwen-max", base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1" },
  { label: "Qwen Turbo", provider: "阿里云", name: "Qwen Turbo", model: "qwen-turbo", base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1" },
  { label: "Llama 3.3 (Groq)", provider: "Groq", name: "Llama 3.3 70B", model: "llama-3.3-70b-versatile", base_url: "https://api.groq.com/openai/v1" },
  { label: "Llama 3.3 (Together)", provider: "Together AI", name: "Llama 3.3 70B", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo", base_url: "https://api.together.xyz/v1" },
  { label: "Grok Beta", provider: "xAI", name: "Grok Beta", model: "grok-beta", base_url: "https://api.x.ai/v1" },
  { label: "混元", provider: "腾讯", name: "混元", model: "hunyuan", base_url: "https://api.hunyuan.cloud.tencent.com/v1" },
  { label: "ERNIE 4.5", provider: "百度", name: "ERNIE 4.5", model: "ernie-4.5", base_url: "https://aip.baidubce.com" },
  { label: "Claude (OpenRouter)", provider: "OpenRouter", name: "Claude Sonnet", model: "anthropic/claude-sonnet-4-20250514", base_url: "https://openrouter.ai/api/v1" },
]

function fillPreset(p: typeof presets[number]) {
  formData.value.provider = p.provider
  formData.value.name = p.name
  formData.value.model = p.model
  formData.value.base_url = p.base_url
}
</script>

<template>
  <div class="model-settings-page">
    <header><h1>⚙️ 模型设置</h1></header>

    <div class="layout">
      <aside class="side-menu">
        <div class="menu-item active" @click="testResult = ''">模型配置</div>
        <div class="menu-item" @click="testResult = ''">代理设置</div>
      </aside>

      <div class="main-area">
        <!-- model configs list -->
        <div class="section-header">
          <h3>模型配置列表</h3>
          <button class="btn-primary" @click="openNewForm">+ 添加模型</button>
        </div>

        <!-- inline form -->
        <div v-if="showForm" class="form-card">
          <div class="preset-row">
            <span class="preset-label">快速填充:</span>
            <button
              v-for="p in presets"
              :key="p.label"
              class="preset-btn"
              @click="fillPreset(p)"
            >{{ p.label }}</button>
          </div>
          <div class="form-row">
            <div class="field">
              <label>供应商</label>
              <input v-model="formData.provider" placeholder="例如: DeepSeek, OpenAI, Anthropic" />
            </div>
            <div class="field">
              <label>名称</label>
              <input v-model="formData.name" placeholder="显示名称" />
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>模型</label>
              <input v-model="formData.model" placeholder="deepseek-chat / gpt-4o / claude-3..." />
            </div>
            <div class="field">
              <label>Base URL</label>
              <input v-model="formData.base_url" placeholder="https://api.deepseek.com" />
            </div>
          </div>
          <div class="field">
            <label>API Key</label>
            <input v-model="formData.api_key" type="password" placeholder="sk-..." />
          </div>
          <div class="field">
            <label>代理地址</label>
            <input v-model="formData.proxy_url" placeholder="http://127.0.0.1:7890（留空直连）" />
          </div>
          <div class="form-actions">
            <button class="btn-primary" @click="saveForm">{{ editingId ? '更新' : '创建' }}</button>
            <button class="btn-cancel" @click="showForm = false">取消</button>
          </div>
        </div>

        <!-- card list -->
        <div v-for="(items, provider) in groupedConfigs" :key="provider" class="provider-group">
          <h4 class="provider-title">{{ provider }}</h4>
          <div v-for="item in items" :key="item.id" class="model-card" :class="{ active: item.is_active === 1 }">
            <div class="card-header">
              <strong>{{ item.name }}</strong>
              <span class="model-tag">{{ item.model }}</span>
              <span v-if="item.is_active === 1" class="active-badge">当前</span>
            </div>
            <div class="card-detail">
              <div>Base URL: {{ item.base_url || '未设置' }}</div>
              <div>代理: {{ item.proxy_url || '无' }}</div>
            </div>
            <div class="card-actions">
              <button class="btn-sm" @click="setActive(item.id)" :disabled="item.is_active === 1">设为当前</button>
              <button class="btn-sm" @click="testModel(item.id)">测试</button>
              <button class="btn-sm" @click="openEdit(item)">编辑</button>
              <button class="btn-sm btn-danger" @click="removeItem(item.id)">删除</button>
            </div>
          </div>
        </div>
        <div v-if="!modelConfigs.length" class="empty-state">暂无模型配置，请点击上方"添加模型"。</div>

        <div v-if="testResult" class="test-result">{{ testResult }}</div>

        <!-- deprecated legacy settings -->
        <details class="legacy-section">
          <summary>传统单模型设置（将逐步弃用）</summary>
          <div class="legacy-body">
            <div class="field">
              <label>API Key</label>
              <input v-model="legacyApiKey" type="password" placeholder="sk-..." />
            </div>
            <div class="field">
              <label>Base URL</label>
              <input v-model="legacyBaseUrl" placeholder="https://api.deepseek.com" />
            </div>
            <div class="field">
              <label>Model</label>
              <input v-model="legacyModel" placeholder="deepseek-v4-flash" />
            </div>
            <div class="actions">
              <button class="btn-sm" @click="testLegacy">测试连接</button>
              <button class="btn-sm btn-primary" @click="saveLegacySettings">保存</button>
            </div>
            <div v-if="legacyTestResult" class="test-result">{{ legacyTestResult }}</div>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-settings-page {
  padding: 24px 32px;
}
header { margin-bottom: 16px; }
.layout {
  display: flex;
  gap: 24px;
}
.side-menu {
  width: 160px;
  min-width: 160px;
  border-right: 1px solid var(--border, #e0e0e0);
  padding-right: 16px;
}
.menu-item {
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary, #666);
  margin-bottom: 4px;
  transition: background 0.2s, color 0.2s;
}
.menu-item:hover { background: var(--hover-bg, #f0f0f0); color: var(--text, #333); }
.menu-item.active { background: var(--primary, #1a73e8); color: #fff; }
.main-area { flex: 1; min-width: 0; }
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-header h3 { margin: 0; font-size: 15px; }
.btn-primary {
  padding: 6px 16px;
  background: var(--primary, #1a73e8);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.btn-primary:hover { background: var(--primary-hover, #1557b0); }
.btn-cancel {
  padding: 6px 16px;
  background: none;
  border: 1px solid var(--border, #ddd);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text, #333);
}
.form-card {
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: var(--card-bg, #fff);
}
.form-row { display: flex; gap: 12px; }
.form-row .field { flex: 1; }
.field { margin-bottom: 12px; }
.field label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: var(--text, #333); }
.field input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border, #ddd);
  border-radius: 6px;
  background: var(--input-bg, #fff);
  color: var(--text, #333);
  font-size: 13px;
}
.form-actions { display: flex; gap: 8px; margin-top: 8px; }
.provider-group { margin-bottom: 20px; }
.provider-title {
  font-size: 13px;
  color: var(--text-secondary, #666);
  margin: 0 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border, #eee);
}
.model-card {
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  background: var(--card-bg, #fff);
  transition: border-color 0.2s;
}
.model-card.active { border-color: var(--primary, #1a73e8); }
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.card-header strong { font-size: 14px; }
.model-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: var(--badge-bg, #e8f0fe);
  border-radius: 4px;
  color: var(--primary, #1a73e8);
}
.active-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #34a853;
  color: #fff;
  border-radius: 4px;
}
.card-detail {
  font-size: 12px;
  color: var(--text-secondary, #666);
  margin-bottom: 8px;
  line-height: 1.6;
}
.card-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.btn-sm {
  padding: 4px 12px;
  border: 1px solid var(--border, #ddd);
  border-radius: 4px;
  font-size: 12px;
  background: var(--input-bg, #fff);
  color: var(--text, #333);
  cursor: pointer;
}
.btn-sm:hover { background: var(--hover-bg, #f0f0f0); }
.btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger { color: #d93025; border-color: #d93025; }
.btn-danger:hover { background: #fce8e6; }
.test-result {
  margin-top: 12px;
  padding: 8px 12px;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 6px;
  font-size: 13px;
}
.empty-state {
  text-align: center;
  padding: 40px 16px;
  color: var(--text-secondary, #999);
  font-size: 14px;
}
.legacy-section {
  margin-top: 32px;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 8px;
  padding: 12px;
}
.legacy-section summary {
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary, #666);
}
.legacy-body {
  margin-top: 12px;
}
.actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
  padding: 8px;
  background: var(--hover-bg, #f5f5f5);
  border-radius: 6px;
  align-items: center;
}
.preset-label {
  font-size: 11px;
  color: var(--text-secondary, #666);
  white-space: nowrap;
  margin-right: 4px;
}
.preset-btn {
  font-size: 11px;
  padding: 2px 8px;
  border: 1px solid var(--border, #ddd);
  border-radius: 4px;
  background: var(--card-bg, #fff);
  color: var(--text, #333);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.preset-btn:hover {
  background: var(--primary, #1a73e8);
  color: #fff;
  border-color: var(--primary, #1a73e8);
}
</style>
