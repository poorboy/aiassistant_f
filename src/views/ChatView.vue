<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from "vue";
import { useChatStore } from "../stores/chatStore";
import { useMCPStore } from "../stores/mcpStore";
import {
  getChatSSE,
  listMCPConnections,
  createConversation,
  listConversations,
  getChatMessages,
  updateConversation,
  deleteConversation,
  listPrompts,
  listModelConfigs,
} from "../api";

const chatStore = useChatStore();
const mcpStore = useMCPStore();
const input = ref("");
const sseRef = ref<EventSource | null>(null);
const editingConvId = ref("");
const editingTitle = ref("");
const messagesRef = ref<HTMLElement | null>(null);
const prompts = ref<any[]>([]);
const selectedPromptId = ref(localStorage.getItem("lastPromptId") || "");
const modelConfigs = ref<any[]>([]);
const selectedModelConfigId = ref(localStorage.getItem("lastModelConfigId") || "");

const safeConvs = computed(() =>
  Array.isArray(chatStore.conversations) ? chatStore.conversations : [],
);
const safeMsgs = computed(() =>
  Array.isArray(chatStore.messages) ? chatStore.messages : [],
);
const totalTokens = computed(() => {
  const conv = chatStore.conversations.find(c => c.id === chatStore.currentConvId);
  return conv?.token_count ?? 0;
});

onMounted(async () => {
  await loadConversations();
  await loadPrompts();
  await loadModelConfigs();
  const convs = safeConvs.value;
  if (convs.length > 0) {
    switchConversation(convs[0].id);
  }
  await refreshTools();
});

async function loadPrompts() {
  try {
    const res = await listPrompts();
    prompts.value = Array.isArray(res.data) ? res.data : [];
  } catch {}
}

async function loadModelConfigs() {
  try {
    const res = await listModelConfigs();
    modelConfigs.value = Array.isArray(res.data) ? res.data : [];
    if (!selectedModelConfigId.value && modelConfigs.value.length > 0) {
      const active = modelConfigs.value.find((m: any) => m.is_active === 1) || modelConfigs.value[0]
      selectedModelConfigId.value = active.id
    }
  } catch {}
}

watch(
  () => chatStore.currentConvId,
  async (id) => {
    if (id) {
      chatStore.clearMessages();
      try {
        const res = await getChatMessages(id);
        const data = Array.isArray(res.data) ? res.data : [];
        chatStore.setMessages(
          data.map((m: any) => ({
            id: m.id || "",
            role: m.role || "assistant",
            content: m.content || "",
            toolCalls: m.tool_calls || null,
          })),
        );
      } catch {}
    }
  },
);

async function loadConversations() {
  try {
    const res = await listConversations();
    chatStore.setConversations(res.data);
  } catch {}
}

async function switchConversation(id: string) {
  chatStore.currentConvId = id;
}

async function newConversation() {
  try {
    const res = await createConversation(selectedPromptId.value);
    const conv = {
      id: res.data.id,
      title: res.data.title,
      message_count: 0,
      token_count: res.data.token_count || 0,
      prompt_id: res.data.prompt_id || '',
      created_at: "",
      updated_at: "",
    };
    chatStore.addConversation(conv);
    chatStore.currentConvId = conv.id;
    chatStore.clearMessages();
  } catch {}
}

async function renameConversation(id: string) {
  const title = editingTitle.value;
  if (!title.trim()) return;
  try {
    await updateConversation(id, title.trim());
    chatStore.updateConversation(id, title.trim());
    editingConvId.value = "";
    editingTitle.value = "";
  } catch {}
}

async function removeConversation(id: string) {
  try {
    await deleteConversation(id);
    chatStore.removeConversation(id);
    if (chatStore.currentConvId === id) {
      chatStore.currentConvId = "";
      chatStore.clearMessages();
    }
  } catch {}
}

async function sendMessage() {
  const msg = input.value.trim();
  if (!msg || !chatStore.currentConvId) return;

  chatStore.addMessage({
    id: Date.now().toString(),
    role: "user",
    content: msg,
  });
  input.value = "";
  chatStore.isStreaming = true;

  const respId = "resp-" + Date.now();
  chatStore.addMessage({ id: respId, role: "assistant", content: "" });

  sseRef.value = getChatSSE(chatStore.currentConvId, msg, selectedPromptId.value, mcpStore.enabledTools, selectedModelConfigId.value);

  sseRef.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "text") {
        chatStore.appendToLast(data.content);
      } else if (data.type === "tool_start") {
        chatStore.appendToLast(
          `\n🛠 Call: ${data.tool}(${JSON.stringify(data.args)})\n`,
        );
      } else if (data.type === "tool_result") {
        chatStore.appendToLast(`✅ ${data.tool}: ${data.message}\n`);
      } else if (data.type === "done") {
        chatStore.isStreaming = false;
        sseRef.value?.close();
        loadConversations(); // refresh title
      }
    } catch {}
  };
  sseRef.value.onerror = () => {
    chatStore.appendToLast("\n[连接错误]");
    chatStore.isStreaming = false;
    sseRef.value?.close();
  };
}

onUnmounted(() => sseRef.value?.close());

function copyMessage(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function reInputMessage(text: string) {
  input.value = text;
  const el = document.querySelector<HTMLInputElement>('input[placeholder*="输入"]');
  el?.focus();
}

function scrollToBottom() {
  nextTick(() => {
    const el = messagesRef.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
}

watch(() => chatStore.messages.length, scrollToBottom);
watch(() => {
  const msgs = chatStore.messages;
  return msgs.length > 0 ? msgs[msgs.length - 1].content.length : 0;
}, scrollToBottom);

watch(selectedPromptId, (id) => {
  localStorage.setItem("lastPromptId", id);
});

watch(selectedModelConfigId, (id) => {
  localStorage.setItem("lastModelConfigId", id);
});

function groupPrompts(list: any[]) {
  const groups: Record<string, any[]> = { custom: [], system: [], blender: [], gimp: [] }
  for (const p of list) {
    const cat = p.category || 'custom'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(p)
  }
  const labelMap: Record<string, string> = { custom: '自定义', system: '系统', blender: 'Blender', gimp: 'GIMP' }
  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([key, items]) => ({ label: labelMap[key] || key, items }))
}

async function refreshTools() {
  try {
    const res = await listMCPConnections();
    const conns = Array.isArray(res.data) ? res.data : [];
    const tools: string[] = [];
    for (const conn of conns) {
      if (conn.status === "connected") {
        tools.push(conn.id);
      }
    }
    mcpStore.enabledTools = tools;
  } catch {}
}
</script>

<template>
  <div class="chat-layout">
    <!-- Left: Conversation list -->
    <aside class="conv-sidebar">
      <div class="conv-header">
        <h3>💬 会话</h3>
        <button class="new-btn" @click="newConversation">+ 新会话</button>
      </div>
      <div class="conv-list">
        <div
          v-for="conv in safeConvs"
          :key="conv.id"
          :class="[
            'conv-item',
            { active: conv.id === chatStore.currentConvId },
          ]"
          @click="switchConversation(conv.id)"
        >
          <div class="conv-title-row">
            <template v-if="editingConvId === conv.id">
              <input
                v-model="editingTitle"
                @blur="renameConversation(conv.id)"
                @keyup.enter="renameConversation(conv.id)"
                class="title-input"
                autofocus
              />
            </template>
            <template v-else>
              <span class="conv-title">{{ conv.title }}</span>
            </template>
            <div
              class="conv-actions"
              v-if="conv.id === chatStore.currentConvId"
            >
              <button
                class="icon-btn"
                @click.stop="
                  editingConvId = conv.id;
                  editingTitle = conv.title;
                "
              >
                ✏️
              </button>
              <button
                class="icon-btn"
                @click.stop="removeConversation(conv.id)"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        <div v-if="!safeConvs.length" class="no-conv">
          暂无会话，点击 + 创建
        </div>
      </div>
    </aside>

    <!-- Right: Messages -->
    <div class="chat-main">
      <div class="messages" ref="messagesRef">
        <div v-for="msg in safeMsgs" :key="msg.id" :class="['msg', msg.role]">
          <div class="role-badge">{{ msg.role === "user" ? "🧑" : "🤖" }}</div>
          <div class="msg-body">
            <div
              class="content"
              v-html="(msg.content || '').replace(/\n/g, '<br>')"
            ></div>
            <div v-if="msg.role === 'user'" class="msg-actions">
              <button class="msg-action-btn" title="复制" @click.stop="copyMessage(msg.content)">📋</button>
              <button class="msg-action-btn" title="重新输入" @click.stop="reInputMessage(msg.content)">↩️</button>
            </div>
          </div>
        </div>
        <div v-if="chatStore.isStreaming" class="streaming-indicator">
          ⏳ AI 思考中...
        </div>
        <div
          v-if="!safeMsgs.length && !chatStore.isStreaming"
          class="empty-hint"
        >
          {{
            chatStore.currentConvId
              ? "输入消息开始对话"
              : "请选择或创建一个会话"
          }}
        </div>
      </div>

      <div class="prompt-bar">
        <select v-model="selectedModelConfigId" class="model-select" title="选择模型">
          <option v-for="m in modelConfigs" :key="m.id" :value="m.id">{{ m.provider }} / {{ m.name }}</option>
        </select>
        <select v-model="selectedPromptId" class="prompt-select">
          <option value="">无系统角色</option>
          <optgroup v-for="g in groupPrompts(prompts)" :key="g.label" :label="g.label">
            <option v-for="p in g.items" :key="p.id" :value="p.id">{{ p.title }}</option>
          </optgroup>
        </select>
        <span class="token-label">Tokens: {{ totalTokens.toLocaleString() }}</span>
      </div>
      <div class="input-area">
        <input
          v-model="input"
          @keyup.enter="sendMessage"
          placeholder="💬 输入消息..."
          :disabled="chatStore.isStreaming || !chatStore.currentConvId"
        />
        <button
          @click="sendMessage"
          :disabled="
            chatStore.isStreaming || !input.trim() || !chatStore.currentConvId
          "
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-layout {
  display: flex;
  height: 100vh;
}
.conv-sidebar {
  width: 260px;
  min-width: 260px;
  border-right: 1px solid var(--border, #e0e0e0);
  background: var(--sidebar-bg, #fff);
  display: flex;
  flex-direction: column;
}
.conv-header {
  padding: 14px;
  border-bottom: 1px solid var(--border, #e0e0e0);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.conv-header h3 {
  margin: 0;
  font-size: 15px;
}
.new-btn {
  padding: 4px 12px;
  border: 1px solid var(--primary, #1a73e8);
  color: var(--primary, #1a73e8);
  background: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}
.conv-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.conv-item {
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 2px;
  transition: background 0.2s;
}
.conv-item:hover {
  background: var(--hover-bg, #f0f0f0);
}
.conv-item.active {
  background: var(--primary, #1a73e8);
  color: #fff;
}
.conv-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}
.conv-title {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.conv-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}
.conv-item:hover .conv-actions,
.conv-item.active .conv-actions {
  opacity: 1;
}
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
  line-height: 1;
}
.title-input {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid var(--border, #ddd);
  border-radius: 4px;
  font-size: 13px;
  background: var(--input-bg, #fff);
  color: var(--text, #333);
}
.no-conv {
  padding: 16px;
  text-align: center;
  color: var(--text-secondary, #999);
  font-size: 13px;
}
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.msg {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.msg.user {
  flex-direction: row-reverse;
}
.msg-body {
  position: relative;
  max-width: 85%;
}
.msg-actions {
  position: absolute;
  top: -8px;
  right: 4px;
  display: none;
  gap: 2px;
}
.msg.user:hover .msg-actions {
  display: flex;
}
.msg-action-btn {
  background: var(--card-bg, #f5f5f5);
  border: 1px solid var(--border, #ddd);
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  padding: 1px 4px;
  line-height: 1.2;
  opacity: 0.8;
  transition: opacity 0.15s;
}
.msg-action-btn:hover {
  opacity: 1;
}
.msg.user .msg-action-btn {
  background: var(--primary, #1a73e8);
  border-color: transparent;
  color: #fff;
}
.role-badge {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--hover-bg, #f0f0f0);
}
.msg-body .content {
  max-width: 85%;
  padding: 12px 18px;
  border-radius: 12px;
  background: var(--card-bg, #f5f5f5);
  line-height: 1.6;
  color: var(--text, #333);
  font-size: 15px;
}
.msg.user .content {
  background: var(--primary, #1a73e8);
  color: #fff;
}
.streaming-indicator {
  text-align: center;
  color: var(--text-secondary, #999);
  padding: 8px;
}
.empty-hint {
  text-align: center;
  color: var(--text-secondary, #999);
  padding: 40px 16px;
  font-size: 14px;
}
.prompt-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 16px;
  border-top: 1px solid var(--border, #eee);
  background: var(--card-bg, #fff);
}
.prompt-select {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border, #ddd);
  border-radius: 6px;
  font-size: 12px;
  background: var(--input-bg, #fff);
  color: var(--text, #333);
}
.token-label {
  font-size: 11px;
  color: var(--text-secondary, #999);
  white-space: nowrap;
}
.input-area {
  display: flex;
  padding: 12px 16px;
  border-top: 1px solid var(--border, #eee);
  gap: 8px;
  background: var(--card-bg, #fff);
}
.input-area input {
  flex: 1;
  padding: 12px 18px;
  border: 1px solid var(--border, #ddd);
  border-radius: 24px;
  outline: none;
  font-size: 15px;
  background: var(--input-bg, #fff);
  color: var(--text, #333);
}
.input-area button {
  padding: 12px 28px;
  background: var(--primary, #1a73e8);
  color: #fff;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 15px;
}
.input-area button:disabled {
  opacity: 0.5;
}
</style>
