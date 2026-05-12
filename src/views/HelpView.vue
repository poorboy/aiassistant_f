<script setup lang="ts">
import { ref } from 'vue'
import { useI18nStore } from '../stores/i18nStore'

const i18n = useI18nStore()
const activeTab = ref('blender')
</script>

<template>
  <div class="help-page">
    <header><h1>{{ i18n.t('helpTitle') }}</h1></header>

    <div class="tab-bar">
      <button :class="['tab', { active: activeTab === 'blender' }]" @click="activeTab = 'blender'">{{ i18n.t('tabBlender') }}</button>
      <button :class="['tab', { active: activeTab === 'gimp' }]" @click="activeTab = 'gimp'">{{ i18n.t('tabGIMP') }}</button>
      <button :class="['tab', { active: activeTab === 'agent' }]" @click="activeTab = 'agent'">{{ i18n.t('tabAgent') }}</button>
    </div>

    <div class="tab-content">
      <div v-show="activeTab === 'blender'" class="markdown-body">
        <h2>{{ i18n.t('helpBlenderHeading') }}</h2>
        <h3>{{ i18n.t('helpBlenderStep1') }}</h3>
        <ol>
          <li>{{ i18n.t('helpBlenderStep1a') }}</li>
          <li>{{ i18n.t('helpBlenderStep1b') }}</li>
          <li>{{ i18n.t('helpBlenderStep1c') }}</li>
        </ol>
        <h3>{{ i18n.t('helpBlenderStep2') }}</h3>
        <ol>
          <li>{{ i18n.t('helpBlenderStep2a') }}</li>
          <li>{{ i18n.t('helpBlenderStep2b') }}</li>
        </ol>
      </div>
      <div v-show="activeTab === 'gimp'" class="markdown-body">
        <h2>{{ i18n.t('helpGIMPHeading') }}</h2>
        <h3>{{ i18n.t('helpGIMPStep1') }}</h3>
        <ol>
          <li>{{ i18n.t('helpGIMPStep1a') }}</li>
          <li>{{ i18n.t('helpGIMPStep1b') }}</li>
          <li>{{ i18n.t('helpGIMPStep1c') }}</li>
        </ol>
        <h3>{{ i18n.t('helpGIMPStep2') }}</h3>
        <ol>
          <li>{{ i18n.t('helpGIMPStep2a') }}</li>
        </ol>
        <p>{{ i18n.t('helpGIMPNote') }}</p>
      </div>
      <div v-show="activeTab === 'agent'" class="markdown-body">
        <h2>{{ i18n.t('helpAgentHeading') }}</h2>
        <h3>{{ i18n.t('helpAgentSubArch') }}</h3>
        <pre>{{ i18n.t('helpAgentArch') }}</pre>
        <h3>{{ i18n.t('helpAgentSubTips') }}</h3>
        <ul>
          <li>{{ i18n.t('helpAgentTip1') }}</li>
          <li>{{ i18n.t('helpAgentTip2') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-page { padding: 24px 32px; }
header { margin-bottom: 16px; }
.tab-bar { display: flex; gap: 0; border-bottom: 2px solid var(--border, #e0e0e0); margin-bottom: 20px; }
.tab {
  padding: 10px 20px; border: none; background: none; cursor: pointer;
  font-size: 14px; color: var(--text-secondary, #666);
  border-bottom: 2px solid transparent; margin-bottom: -2px;
  transition: color 0.2s, border-color 0.2s;
}
.tab:hover { color: var(--text, #333); }
.tab.active { color: var(--primary, #1a73e8); border-bottom-color: var(--primary, #1a73e8); font-weight: 600; }
.markdown-body {
  padding: 16px;
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 8px;
  background: var(--card-bg, #fff);
  font-size: 14px;
  line-height: 1.7;
  color: var(--text, #333);
  white-space: pre-wrap;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
