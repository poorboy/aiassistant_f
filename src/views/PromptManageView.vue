<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18nStore } from "../stores/i18nStore";
import { listPrompts, createPrompt, updatePrompt, deletePrompt } from "../api";

const i18n = useI18nStore();
const prompts = ref<any[]>([]);
const showForm = ref(false);
const editId = ref("");
const formTitle = ref("");
const formContent = ref("");
const formCategory = ref("custom");
const activeCat = ref("all");
const editingCells = ref<Record<string, boolean>>({});
const editingTitles = ref<Record<string, string>>({});
const editingContents = ref<Record<string, string>>({});

const categories = ["all", "custom", "system", "blender", "gimp"];
const catLabel: Record<string, string> = {
  all: i18n.t('tabAllCategory'),
  custom: i18n.t('optionCustom'),
  system: i18n.t('optionSystem'),
  blender: i18n.t('optionBlender'),
  gimp: i18n.t('optionGIMP'),
}

const filtered = computed(() => {
  if (activeCat.value === "all") return prompts.value;
  return prompts.value.filter((p: any) => p.category === activeCat.value);
});

onMounted(loadPrompts);

async function loadPrompts() {
  try {
    const res = await listPrompts();
    prompts.value = Array.isArray(res.data) ? res.data : [];
  } catch {}
}

function openNew() {
  editId.value = "";
  formTitle.value = "";
  formContent.value = "";
  formCategory.value = "custom";
  showForm.value = true;
}

async function save() {
  if (!formTitle.value.trim() || !formContent.value.trim()) return;
  if (editId.value) {
    await updatePrompt(editId.value, formTitle.value, formContent.value, formCategory.value);
  } else {
    await createPrompt(formTitle.value, formContent.value, formCategory.value);
  }
  showForm.value = false;
  await loadPrompts();
}

async function doDelete(id: string) {
  if (!confirm(i18n.t('confirmDelete'))) return;
  await deletePrompt(id);
  await loadPrompts();
}

function startEdit(p: any) {
  editingCells.value[p.id] = true;
  editingTitles.value[p.id] = p.title;
  editingContents.value[p.id] = p.content;
}

function cancelEdit(id: string) {
  editingCells.value[id] = false;
  delete editingTitles.value[id];
  delete editingContents.value[id];
}

async function saveEdit(p: any) {
  const newTitle = editingTitles.value[p.id]?.trim() || p.title;
  const newContent = editingContents.value[p.id]?.trim() || p.content;
  await updatePrompt(p.id, newTitle, newContent, p.category);
  editingCells.value[p.id] = false;
  delete editingTitles.value[p.id];
  delete editingContents.value[p.id];
  await loadPrompts();
}
</script>

<template>
  <div class="prompts-page">
    <header>
      <h1>{{ i18n.t('promptTitle') }}</h1>
      <button class="btn btn-primary" @click="openNew">{{ i18n.t('newPrompt') }}</button>
    </header>

    <div v-if="showForm" class="form-overlay" @click.self="showForm = false">
      <div class="form-card">
        <h3>{{ editId ? i18n.t('editPrompt') : i18n.t('newPromptDialog') }}</h3>
        <div class="field">
          <label>{{ i18n.t('fieldTitle') }}</label>
          <input v-model="formTitle" :placeholder="i18n.t('placeholderTitle')" />
        </div>
        <div class="field">
          <label>{{ i18n.t('fieldCategory') }}</label>
          <select v-model="formCategory">
            <option value="custom">{{ i18n.t('optionCustom') }}</option>
            <option value="system">{{ i18n.t('optionSystem') }}</option>
            <option value="blender">{{ i18n.t('optionBlender') }}</option>
            <option value="gimp">{{ i18n.t('optionGIMP') }}</option>
          </select>
        </div>
        <div class="field">
          <label>{{ i18n.t('fieldContent') }}</label>
          <textarea v-model="formContent" rows="8" :placeholder="i18n.t('placeholderContent')" />
        </div>
        <div class="form-actions">
          <button class="btn" @click="showForm = false">{{ i18n.t('cancel') }}</button>
          <button class="btn btn-primary" @click="save">{{ i18n.t('save') }}</button>
        </div>
      </div>
    </div>

    <div class="cat-bar">
      <button v-for="cat in categories" :key="cat" :class="['cat-tab', { active: activeCat === cat }]" @click="activeCat = cat">
        {{ catLabel[cat] }}
      </button>
    </div>

    <div class="table-wrap">
      <table class="prompt-table">
        <thead>
          <tr>
            <th class="col-idx">{{ i18n.t('colID') }}</th>
            <th class="col-title">{{ i18n.t('colTitle') }}</th>
            <th class="col-cat">{{ i18n.t('colCategory') }}</th>
            <th class="col-content">{{ i18n.t('colContent') }}</th>
            <th class="col-action">{{ i18n.t('colActions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in filtered" :key="p.id">
            <td class="col-idx">{{ i + 1 }}</td>
            <td class="col-title">
              <input v-if="editingCells[p.id]" v-model="editingTitles[p.id]" class="inline-input" />
              <span v-else>{{ p.title }}</span>
            </td>
            <td class="col-cat">
              <span :class="['cat-badge', p.category]">{{ p.category }}</span>
            </td>
            <td class="col-content">
              <textarea v-if="editingCells[p.id]" v-model="editingContents[p.id]" class="inline-textarea" rows="3" />
              <span v-else class="content-preview">{{ p.content }}</span>
            </td>
            <td class="col-action">
              <template v-if="editingCells[p.id]">
                <button class="btn-xs btn-save" @click="saveEdit(p)">{{ i18n.t('save') }}</button>
                <button class="btn-xs" @click="cancelEdit(p.id)">{{ i18n.t('cancel') }}</button>
              </template>
              <template v-else>
                <button class="btn-xs" @click="startEdit(p)">{{ i18n.t('edit') }}</button>
                <button class="btn-xs btn-danger" @click="doDelete(p.id)">{{ i18n.t('delete') }}</button>
              </template>
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="5" class="empty-cell">{{ i18n.t('tableEmpty') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.prompts-page { padding: 24px 32px; }
header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.btn { padding: 8px 20px; border: 1px solid var(--border, #ddd); border-radius: 6px; background: var(--input-bg, #fff); color: var(--text, #333); font-size: 13px; cursor: pointer; }
.btn-primary { background: var(--primary, #1a73e8); color: #fff; border: none; }
.btn-primary:hover { background: var(--primary-hover, #1557b0); }
.btn-xs { padding: 3px 10px; border: 1px solid var(--border, #ddd); border-radius: 4px; background: var(--input-bg, #fff); color: var(--text, #333); font-size: 12px; cursor: pointer; margin-right: 4px; }
.btn-save { background: var(--primary, #1a73e8); color: #fff; border: none; }
.btn-danger { color: #c62828; border-color: #c62828; }
.form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.form-card { background: var(--card-bg, #fff); border-radius: 12px; padding: 24px; width: 560px; max-width: 90vw; max-height: 80vh; overflow-y: auto; }
.form-card h3 { margin-bottom: 16px; }
.field { margin-bottom: 12px; }
.field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.field input, .field select, .field textarea { width: 100%; padding: 8px 10px; border: 1px solid var(--border, #ddd); border-radius: 6px; background: var(--input-bg, #fff); color: var(--text, #333); font-size: 13px; }
.field textarea { resize: vertical; }
.form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.cat-bar { display: flex; gap: 0; border-bottom: 2px solid var(--border, #e0e0e0); margin-bottom: 14px; }
.cat-tab { padding: 8px 18px; border: none; background: none; cursor: pointer; font-size: 13px; color: var(--text-secondary, #666); border-bottom: 2px solid transparent; margin-bottom: -2px; transition: color 0.2s, border-color 0.2s; }
.cat-tab:hover { color: var(--text, #333); }
.cat-tab.active { color: var(--primary, #1a73e8); border-bottom-color: var(--primary, #1a73e8); font-weight: 600; }
.table-wrap { border: 1px solid var(--border, #e0e0e0); border-radius: 8px; overflow: hidden; }
.prompt-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.prompt-table thead { background: var(--hover-bg, #f5f5f5); }
.prompt-table th { text-align: left; padding: 10px 12px; font-weight: 600; color: var(--text-secondary, #666); font-size: 12px; border-bottom: 1px solid var(--border, #e0e0e0); white-space: nowrap; }
.prompt-table td { padding: 8px 12px; border-bottom: 1px solid var(--border, #eee); vertical-align: top; }
.prompt-table tbody tr:hover { background: var(--hover-bg, #fafafa); }
.col-idx { width: 40px; text-align: center; color: var(--text-secondary, #999); }
.col-title { width: 160px; }
.col-cat { width: 100px; }
.col-action { width: 130px; white-space: nowrap; }
.cat-badge { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
.cat-badge.custom { background: #e8f0fe; color: #1a73e8; }
.cat-badge.system { background: #fce8e6; color: #c62828; }
.cat-badge.blender { background: #e8f5e9; color: #2e7d32; }
.cat-badge.gimp { background: #fff3e0; color: #e65100; }
.content-preview { display: block; max-height: 60px; overflow: hidden; color: var(--text-secondary, #666); font-size: 12px; line-height: 1.5; word-break: break-all; }
.inline-input { width: 100%; padding: 4px 6px; border: 1px solid var(--primary, #1a73e8); border-radius: 4px; font-size: 13px; background: var(--input-bg, #fff); color: var(--text, #333); }
.inline-textarea { width: 100%; padding: 4px 6px; border: 1px solid var(--primary, #1a73e8); border-radius: 4px; font-size: 12px; background: var(--input-bg, #fff); color: var(--text, #333); resize: vertical; }
.empty-cell { text-align: center; padding: 40px !important; color: var(--text-secondary, #999); }
</style>
