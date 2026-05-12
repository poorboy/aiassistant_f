<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useSettingsStore } from "../stores/settingsStore";
import { useI18nStore } from "../stores/i18nStore";
import { getSettings, updateSettings, testWebhook } from "../api";

const i18n = useI18nStore();
const settingsStore = useSettingsStore();
const activeTab = ref("notify");

const webhookURL = ref("");
const webhookKeywords = ref("");
const notifyTestResult = ref("");
const workDir = ref("");

onMounted(async () => {
  try {
    const res = await getSettings();
    settingsStore.setAll(res.data);
    webhookURL.value = res.data["webhook.url"] || "";
    webhookKeywords.value = res.data["webhook.keywords"] || "";
    workDir.value = res.data["blender.work_dir"] || "";
  } catch {}
});

async function saveNotifySettings() {
  await updateSettings({
    "webhook.url": webhookURL.value,
    "webhook.keywords": webhookKeywords.value,
  });
  settingsStore.setAll({
    "webhook.url": webhookURL.value,
    "webhook.keywords": webhookKeywords.value,
  });
  alert(i18n.t('saved'));
}

async function doTestNotify() {
  try {
    const res = await testWebhook()
    notifyTestResult.value = res.data.status === "ok" ? i18n.t('testOk') : i18n.t('testFail') + ": " + (res.data.message || "");
  } catch (e: any) {
    notifyTestResult.value = i18n.t('testFail') + ": " + (e?.response?.data?.error || e?.message || "");
  }
}

async function saveWorkDir() {
  await updateSettings({ "blender.work_dir": workDir.value });
  settingsStore.setAll({ "blender.work_dir": workDir.value });
  alert(i18n.t('saved'));
}
</script>

<template>
  <div class="settings-page">
    <header><h1>{{ i18n.t('settingsTitle') }}</h1></header>

    <div class="tab-bar">
      <button :class="['tab', { active: activeTab === 'notify' }]" @click="activeTab = 'notify'">🔔 通知</button>
      <button :class="['tab', { active: activeTab === 'other' }]" @click="activeTab = 'other'">{{ i18n.t('tabOther') }}</button>
    </div>

    <div v-show="activeTab === 'notify'" class="tab-content">
      <div class="section">
        <div class="field">
          <label>Webhook URL</label>
          <input v-model="webhookURL" placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..." />
        </div>
        <div class="field">
          <label>触发关键词 (逗号分隔)</label>
          <input v-model="webhookKeywords" placeholder="错误,失败,error,fail" />
        </div>
        <div class="help-text">
          <p>AI 完成任务后，若回复内容匹配关键词则自动发送 Webhook 通知。不填关键词则所有任务均触发。</p>
        </div>
        <div class="actions">
          <button @click="doTestNotify">测试通知</button>
          <button @click="saveNotifySettings">{{ i18n.t('save') }}</button>
        </div>
        <div v-if="notifyTestResult" class="test-result">{{ notifyTestResult }}</div>
      </div>
    </div>

    <div v-show="activeTab === 'other'" class="tab-content">
      <div class="section">
        <div class="field">
          <label>{{ i18n.t('fieldWorkDir') }}</label>
          <input v-model="workDir" :placeholder="i18n.t('placeholderWorkDir')" />
        </div>
        <div class="help-text">
          <p>{{ i18n.t('helpWorkDir') }}</p>
        </div>
        <div class="actions">
          <button @click="saveWorkDir">{{ i18n.t('btnSave') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page { padding: 24px 32px; }
header { margin-bottom: 16px; }
.tab-bar { display: flex; gap: 0; border-bottom: 2px solid var(--border, #e0e0e0); margin-bottom: 20px; }
.tab { padding: 10px 20px; border: none; background: none; cursor: pointer; font-size: 14px; color: var(--text-secondary, #666); border-bottom: 2px solid transparent; margin-bottom: -2px; transition: color 0.2s, border-color 0.2s; }
.tab:hover { color: var(--text, #333); }
.tab.active { color: var(--primary, #1a73e8); border-bottom-color: var(--primary, #1a73e8); font-weight: 600; }
.section { padding: 16px; border: 1px solid var(--border, #e0e0e0); border-radius: 8px; background: var(--card-bg, #fff); }
.field { margin-bottom: 14px; }
.field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--text, #333); }
.field input { width: 100%; padding: 8px 10px; border: 1px solid var(--border, #ddd); border-radius: 6px; background: var(--input-bg, #fff); color: var(--text, #333); }
.help-text { margin-top: 10px; padding: 8px; background: var(--hover-bg, #f5f5f5); border-radius: 6px; font-size: 12px; color: var(--text-secondary, #666); }
.actions { display: flex; gap: 8px; margin-top: 12px; }
.actions button { padding: 8px 20px; background: var(--primary, #1a73e8); color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.test-result { margin-top: 8px; font-size: 13px; }
</style>
