<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useChatStore } from "../stores/chatStore";
import { useMCPStore } from "../stores/mcpStore";
import {
  getChatSSE,
  listMCPTools,
  listMCPConnections,
  createConversation,
  listConversations,
  getChatMessages,
  updateConversation,
  deleteConversation,
} from "../api";

const chatStore = useChatStore();
const mcpStore = useMCPStore();
const input = ref("");
const sseRef = ref<EventSource | null>(null);

const editingConvId = ref("");

const safeConvs = computed(() =>
  Array.isArray(chatStore.conversations) ? chatStore.conversations : [],
);
const safeMsgs = computed(() =>
  Array.isArray(chatStore.messages) ? chatStore.messages : [],
);
const safeTools = computed(() =>
  Array.isArray(mcpStore.availableTools) ? mcpStore.availableTools : [],
);

onMounted(async () => {
  await loadConversations();
  const convs = safeConvs.value;
  if (convs.length > 0) {
    switchConversation(convs[0].id);
  }
  await refreshTools();
});

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
    const res = await createConversation();
    const conv = {
      id: res.data.id,
      title: res.data.title,
      message_count: 0,
      created_at: "",
      updated_at: "",
    };
    chatStore.addConversation(conv);
    chatStore.currentConvId = conv.id;
    chatStore.clearMessages();
  } catch {}
}

async function renameConversation(id: string) {
  const title = editingConvId.value;
  if (!title.trim()) return;
  try {
    await updateConversation(id, title.trim());
    chatStore.updateConversation(id, title.trim());
    editingConvId.value = "";
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

  const enabled = mcpStore.enabledTools.join(",");
  sseRef.value = getChatSSE(chatStore.currentConvId, msg, enabled);

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

async function refreshTools() {
  try {
    const res = await listMCPConnections();
    const conns = Array.isArray(res.data) ? res.data : [];
    const allTools: string[] = [];
    for (const conn of conns) {
      if (conn.status === "connected") {
        try {
          const toolsRes = await listMCPTools(conn.id);
          const tools = Array.isArray(toolsRes.data) ? toolsRes.data : [];
          tools.forEach((t: any) => allTools.push(t.name));
        } catch {}
      }
    }
    mcpStore.availableTools = allTools;
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
                v-model="editingConvId"
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
                  editingConvId = conv.title;
                  editingConvId = conv.id;
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
          <div
            class="content"
            v-html="(msg.content || '').replace(/\n/g, '<br>')"
          ></div>
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

      <div class="mcp-tools-panel" v-if="safeTools.length">
        <span class="panel-title">📎 MCP Tools</span>
        <label v-for="tool in safeTools" :key="tool" class="tool-toggle">
          <input
            type="checkbox"
            :checked="mcpStore.enabledTools.includes(tool)"
            @change="mcpStore.toggleTool(tool)"
          />
          {{ tool }}
        </label>
        <button @click="refreshTools" class="btn-sm">刷新</button>
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
.role-badge {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--hover-bg, #f0f0f0);
}
.msg .content {
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
.mcp-tools-panel {
  padding: 8px 16px;
  border-top: 1px solid var(--border, #eee);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  background: var(--card-bg, #fff);
}
.panel-title {
  font-weight: bold;
  font-size: 13px;
  margin-right: 4px;
}
.tool-toggle {
  font-size: 12px;
}
.btn-sm {
  font-size: 12px;
  padding: 2px 8px;
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
.prompt-search-bar {
  padding: 4px 16px;
  border-top: 1px solid var(--border, #eee);
  background: var(--card-bg, #fff);
}
.prompt-search-btn {
  font-size: 12px;
  padding: 4px 12px;
  border: 1px solid var(--border, #ddd);
  border-radius: 6px;
  background: var(--input-bg, #fff);
  color: var(--text, #333);
  cursor: pointer;
}
.prompt-search-panel {
  margin-top: 6px;
  border: 1px solid var(--border, #ddd);
  border-radius: 8px;
  padding: 8px;
  background: var(--card-bg, #fff);
  max-height: 200px;
  overflow-y: auto;
}
.prompt-search-input-row {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
}
.prompt-search-input-row input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--border, #ddd);
  border-radius: 6px;
  font-size: 13px;
  background: var(--input-bg, #fff);
  color: var(--text, #333);
}
.prompt-result-item {
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.prompt-result-item:hover {
  background: var(--hover-bg, #f0f0f0);
}
.prompt-result-item strong {
  font-size: 12px;
}
.prompt-result-item span {
  color: var(--text-secondary, #666);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
