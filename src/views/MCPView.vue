<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useMCPStore } from "../stores/mcpStore";
import { useI18nStore } from "../stores/i18nStore";
import { listMCPConnections, connectMCP, disconnectMCP, getMCPLogs } from "../api";

const i18n = useI18nStore();
const mcpStore = useMCPStore();
const connecting = ref<string | null>(null);
const errorMsg = ref("");
const activeTab = ref("all");
const rawLogs = ref<Record<string, string[]>>({});
const logTimer = ref<ReturnType<typeof setInterval> | null>(null);
const logFiles = ref<Record<string, string>>({});

const displayLogs = computed(() => {
  if (activeTab.value === "all") {
    const all: { id: string; text: string }[] = [];
    for (const c of mcpStore.connections) {
      const arr = rawLogs.value[c.id];
      if (arr) arr.forEach(l => all.push({ id: c.id, text: l }));
    }
    return all;
  }
  return (rawLogs.value[activeTab.value] || []).map(l => ({ id: activeTab.value, text: l }));
});

const currentConn = computed(() =>
  mcpStore.connections.find(c => c.id === activeTab.value)
);

async function fetchLogs() {
  for (const c of mcpStore.connections) {
    try {
      const res = await getMCPLogs(c.id);
      if (res.data?.lines) {
        rawLogs.value[c.id] = res.data.lines;
        logFiles.value[c.id] = res.data.file || "";
      }
    } catch {}
  }
}

onMounted(async () => {
  const res = await listMCPConnections();
  mcpStore.setConnections(Array.isArray(res.data) ? res.data : []);
  await fetchLogs();
  logTimer.value = setInterval(fetchLogs, 3000);
});

onUnmounted(() => {
  if (logTimer.value) clearInterval(logTimer.value);
});

async function doConnect(id: string) {
  connecting.value = id;
  errorMsg.value = "";
  try {
    await connectMCP(id);
    const conn = mcpStore.connections.find(c => c.id === id);
    if (conn) conn.status = "connected";
    await fetchLogs();
  } catch (e: any) {
    errorMsg.value = `${i18n.t('connectFail')}: ${e?.message || ""}`;
  } finally {
    connecting.value = null;
  }
}

async function doDisconnect(id: string) {
  errorMsg.value = "";
  try {
    await disconnectMCP(id);
    const conn = mcpStore.connections.find(c => c.id === id);
    if (conn) conn.status = "disconnected";
    await fetchLogs();
  } catch (e: any) {
    errorMsg.value = `${i18n.t('disconnectFail')}: ${e?.message || ""}`;
  }
}
</script>

<template>
  <div class="bridge-page">
    <header>
      <h1>{{ i18n.t('mcpTitle') }}</h1>
    </header>

    <div v-if="errorMsg" class="error-bar">{{ errorMsg }}</div>

    <div class="log-section">
      <div class="log-tabs">
        <button :class="['log-tab', { active: activeTab === 'all' }]" @click="activeTab = 'all'">{{ i18n.t('tabAll') }}</button>
        <button v-for="c in mcpStore.connections" :key="c.id" :class="['log-tab', { active: activeTab === c.id }]" @click="activeTab = c.id">
          <span :class="['tdot', c.status]" />{{ c.name }}
        </button>
      </div>
      <div class="log-toolbar" v-if="currentConn">
        <span class="conn-name">{{ currentConn.name }}</span>
        <span :class="['status-badge', currentConn.status]">
          {{ currentConn.status === "connected" ? i18n.t('statusConnected') : i18n.t('statusDisconnected') }}
        </span>
        <button v-if="currentConn.status === 'disconnected'" :disabled="connecting === currentConn.id" class="btn btn-connect" @click="doConnect(currentConn.id)">
          {{ connecting === currentConn.id ? i18n.t('btnConnecting') : i18n.t('btnConnect') }}
        </button>
        <button v-if="currentConn.status === 'connected'" class="btn btn-disconnect" @click="doDisconnect(currentConn.id)">
          {{ i18n.t('btnDisconnect') }}
        </button>
        <span v-if="logFiles[currentConn.id]" class="log-file">{{ logFiles[currentConn.id] }}</span>
      </div>
      <div class="log-toolbar" v-else>
        <span class="conn-name">{{ i18n.t('allServices') }}</span>
      </div>
      <div class="log-area">
        <div v-if="displayLogs.length === 0" class="log-empty">{{ i18n.t('logEmpty') }}</div>
        <div v-for="(log, i) in displayLogs" :key="i" class="log-line">
          <span class="log-text">{{ log.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bridge-page { padding: 24px 32px; }
header { margin-bottom: 16px; }
header h1 { font-size: 22px; }
.error-bar { padding: 10px 14px; background: #fdecea; color: #c62828; border-radius: 6px; margin-bottom: 12px; font-size: 13px; }
.log-section { border: 1px solid var(--border, #e0e0e0); border-radius: 10px; background: var(--card-bg, #fff); overflow: hidden; }
.log-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border, #e0e0e0); padding: 0 16px; }
.log-tab { display: flex; align-items: center; gap: 6px; padding: 10px 16px; border: none; background: none; cursor: pointer; font-size: 13px; color: var(--text-secondary, #666); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color 0.2s, border-color 0.2s; }
.log-tab:hover { color: var(--text, #333); }
.log-tab.active { color: var(--primary, #1a73e8); border-bottom-color: var(--primary, #1a73e8); font-weight: 600; }
.tdot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.tdot.connected { background: #34a853; }
.tdot.disconnected { background: #999; }
.log-toolbar { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-bottom: 1px solid var(--border, #eee); }
.conn-name { font-weight: 600; font-size: 14px; margin-right: 4px; }
.status-badge { font-size: 12px; padding: 2px 10px; border-radius: 12px; font-weight: 600; }
.status-badge.connected { background: #e6f4ea; color: #34a853; }
.status-badge.disconnected { background: #f0f0f0; color: #999; }
.log-file { font-size: 11px; color: var(--text-secondary, #999); margin-left: auto; }
.btn { padding: 6px 16px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; transition: opacity 0.2s; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-connect { background: var(--primary, #1a73e8); color: #fff; }
.btn-disconnect { background: #c62828; color: #fff; }
.log-area { padding: 12px 20px; max-height: 500px; overflow-y: auto; background: #1a1a2e; font-family: "Cascadia Code", "Fira Code", "Consolas", monospace; font-size: 12px; line-height: 1.7; }
.log-empty { color: #666; text-align: center; padding: 20px; }
.log-line { color: #c0c0d0; }
.log-line:hover { background: rgba(255,255,255,0.04); }
.log-text { color: #d0d0e0; white-space: pre-wrap; word-break: break-all; }
</style>
