<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('blender')

const blenderDocs = `
# Blender 插件配置指南

## 1. 安装插件

1. 打开 Blender → 编辑 → 偏好设置 → 插件
2. 点击 "安装..."，选择 \`plugin/blender-mcp-addon.py\`
3. 勾选启用 "Blender MCP"
4. 回到主界面 按N键  找到 BlenderMCP  ==>  Connect to MCP Server 按钮启动  端口为  9876   启动 
 
`.trim()

const gimpDocs = `
# GIMP MCP 插件配置指南

## 1. 安装插件

1. 打开 GIMP → 编辑 → 首选项 → 文件夹 → 插件
2. 将 \`plugin/gimp-mcp-plugin.py\` 复制到 GIMP 插件目录
3. 重启 GIMP
4. 启动 GIMP 进入主界面   工具 ==> MCP==>  Start MCP Server
确保 GIMP 正在运行且插件已加载，然后在聊天中发送图像处理指令。
`.trim()

const agentDocs = `
# AI Agent 帮助

## 系统架构

\`\`\`
用户聊天 → DeepSeek API (理解意图) → MCP 协议 → Blender/GIMP → 结果回显
\`\`\`
 
## 提示 
- 支持多个 MCP 连接同时在线
- 支持白天/夜间主题切换
`.trim()
</script>

<template>
  <div class="help-page">
    <header><h1>❓ 帮助中心</h1></header>

    <div class="tab-bar">
      <button :class="['tab', { active: activeTab === 'blender' }]" @click="activeTab = 'blender'">🔷 Blender MCP</button>
      <button :class="['tab', { active: activeTab === 'gimp' }]" @click="activeTab = 'gimp'">🎨 GIMP MCP</button>
      <button :class="['tab', { active: activeTab === 'agent' }]" @click="activeTab = 'agent'">🤖 Agent 帮助</button>
    </div>

    <div class="tab-content">
      <div v-show="activeTab === 'blender'" class="markdown-body" v-html="blenderDocs.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&lt;br&gt;/g, '<br>').replace(/\n/g, '<br>').replace(/```/g, '<br>```<br>')"></div>
      <div v-show="activeTab === 'gimp'" class="markdown-body" v-html="gimpDocs.replace(/\n/g, '<br>')"></div>
      <div v-show="activeTab === 'agent'" class="markdown-body" v-html="agentDocs.replace(/\n/g, '<br>')"></div>
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
