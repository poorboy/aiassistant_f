<script setup lang="ts">
import { ref, onMounted } from "vue";
import { listUserPrompts, createUserPrompt, updateUserPrompt, deleteUserPrompt } from "../api";

const prompts = ref<any[]>([]);
const showForm = ref(false);
const editingId = ref("");
const formTitle = ref("");
const formContent = ref("");

onMounted(loadData);

async function loadData() {
  try {
    const res = await listUserPrompts();
    prompts.value = Array.isArray(res.data) ? res.data : [];
  } catch {}
}

function openNew() {
  showForm.value = true;
  editingId.value = "";
  formTitle.value = "";
  formContent.value = "";
}

function openEdit(item: any) {
  showForm.value = true;
  editingId.value = item.id;
  formTitle.value = item.title;
  formContent.value = item.content;
}

async function save() {
  if (!formTitle.value.trim() || !formContent.value.trim()) return;
  try {
    if (editingId.value) {
      await updateUserPrompt(editingId.value, formTitle.value, formContent.value);
    } else {
      await createUserPrompt(formTitle.value, formContent.value);
    }
    showForm.value = false;
    await loadData();
  } catch {}
}

async function remove(id: string) {
  if (!confirm("确认删除？")) return;
  try {
    await deleteUserPrompt(id);
    await loadData();
  } catch {}
}

function insertToChat(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}
</script>

<template>
  <div class="user-prompt-page">
    <header>
      <h1>📋 用户提示词</h1>
      <span class="subtitle">保存常用的消息模板，一键复制到聊天输入框</span>
    </header>

    <div class="toolbar">
      <button class="btn-primary" @click="openNew">+ 新建提示词</button>
    </div>

    <div v-if="showForm" class="form-card">
      <div class="field">
        <label>标题</label>
        <input v-model="formTitle" placeholder="提示词标题" />
      </div>
      <div class="field">
        <label>内容</label>
        <textarea v-model="formContent" rows="4" placeholder="提示词内容，发送给 AI 的消息"></textarea>
      </div>
      <div class="form-actions">
        <button class="btn-primary" @click="save">{{ editingId ? '更新' : '创建' }}</button>
        <button class="btn-cancel" @click="showForm = false">取消</button>
      </div>
    </div>

    <div class="list">
      <div v-for="item in prompts" :key="item.id" class="card">
        <div class="card-header">
          <strong>{{ item.title }}</strong>
          <div class="card-actions">
            <button class="btn-sm" @click="insertToChat(item.content)" title="复制到剪贴板">📋 复制</button>
            <button class="btn-sm" @click="openEdit(item)">编辑</button>
            <button class="btn-sm btn-danger" @click="remove(item.id)">删除</button>
          </div>
        </div>
        <div class="card-body">{{ item.content }}</div>
      </div>
      <div v-if="!prompts.length" class="empty">暂无提示词，点击上方按钮创建。</div>
    </div>
  </div>
</template>

<style scoped>
.user-prompt-page {
  padding: 24px 32px;
}
header { margin-bottom: 16px; }
header h1 { margin: 0 0 4px; }
.subtitle { font-size: 13px; color: var(--text-secondary, #666); }
.toolbar { margin-bottom: 16px; }
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
.field { margin-bottom: 12px; }
.field label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 4px; color: var(--text, #333); }
.field input, .field textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border, #ddd);
  border-radius: 6px;
  background: var(--input-bg, #fff);
  color: var(--text, #333);
  font-size: 13px;
  resize: vertical;
}
.form-actions { display: flex; gap: 8px; }
.list { display: flex; flex-direction: column; gap: 8px; }
.card {
  border: 1px solid var(--border, #e0e0e0);
  border-radius: 8px;
  padding: 12px;
  background: var(--card-bg, #fff);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.card-header strong { font-size: 14px; }
.card-actions { display: flex; gap: 6px; }
.card-body {
  font-size: 13px;
  color: var(--text-secondary, #666);
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}
.btn-sm {
  padding: 4px 10px;
  border: 1px solid var(--border, #ddd);
  border-radius: 4px;
  font-size: 12px;
  background: var(--input-bg, #fff);
  color: var(--text, #333);
  cursor: pointer;
}
.btn-sm:hover { background: var(--hover-bg, #f0f0f0); }
.btn-danger { color: #d93025; border-color: #d93025; }
.btn-danger:hover { background: #fce8e6; }
.empty {
  text-align: center;
  padding: 40px 16px;
  color: var(--text-secondary, #999);
  font-size: 14px;
}
</style>
