import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV
  ? 'http://localhost:41400'
  : window.location.origin)

const api = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 30000,
})

export function getChatSSE(conversationId: string, message: string, promptId: string, enabledTools?: string[], modelConfigId?: string) {
  const tools = enabledTools && enabledTools.length > 0 ? enabledTools.join(',') : ''
  const params = new URLSearchParams({ conversation_id: conversationId, message, prompt_id: promptId, enabled_tools: tools })
  if (modelConfigId) params.set('model_config_id', modelConfigId)
  return new EventSource(`${BASE}/api/chat/stream?${params}`)
}

export function getChatMessages(conversationId: string) {
  return api.get('/chat/messages', { params: { conversation_id: conversationId } })
}

export function listConversations() {
  return api.get('/chat/conversations')
}

export function createConversation(promptId?: string) {
  return api.post('/chat/conversations', { prompt_id: promptId || '' })
}

export function updateConversation(id: string, title: string, promptId?: string) {
  return api.put(`/chat/conversations/${id}`, { title, prompt_id: promptId || '' })
}

export function deleteConversation(id: string) {
  return api.delete(`/chat/conversations/${id}`)
}

export function clearChatHistory() {
  return api.delete('/chat/history')
}

export function testDeepSeek() {
  return api.post('/deepseek/test')
}

export function getSettings() {
  return api.get('/settings')
}

export function updateSettings(data: Record<string, string>) {
  return api.put('/settings', data)
}

export function listMCPConnections() {
  return api.get('/mcp/connections')
}

export function connectMCP(id: string) {
  return api.post(`/mcp/connections/${id}/connect`)
}

export function disconnectMCP(id: string) {
  return api.post(`/mcp/connections/${id}/disconnect`)
}

export function listMCPTools(id: string) {
  return api.get(`/mcp/connections/${id}/tools`)
}

export function startMCPProcess(id: string) {
  return api.post(`/mcp/connections/${id}/start-process`)
}

export function stopMCPProcess(id: string) {
  return api.post(`/mcp/connections/${id}/stop-process`)
}

export function getMCPLogs(id: string) {
  return api.get(`/mcp/connections/${id}/logs`)
}

export function getMCPProcessStatus(id: string) {
  return api.get(`/mcp/connections/${id}/process-status`)
}

export function listPrompts() {
  return api.get('/prompts')
}

export function createPrompt(title: string, content: string, category: string) {
  return api.post('/prompts', { title, content, category })
}

export function updatePrompt(id: string, title: string, content: string, category: string) {
  return api.put(`/prompts/${id}`, { title, content, category })
}

export function deletePrompt(id: string) {
  return api.delete(`/prompts/${id}`)
}

export function listModelConfigs() {
  return api.get('/model-configs')
}

export function createModelConfig(data: { provider: string; name: string; model: string; base_url: string; api_key: string; proxy_url: string }) {
  return api.post('/model-configs', data)
}

export function updateModelConfig(id: string, data: { provider: string; name: string; model: string; base_url: string; api_key: string; proxy_url: string }) {
  return api.put(`/model-configs/${id}`, data)
}

export function deleteModelConfig(id: string) {
  return api.delete(`/model-configs/${id}`)
}

export function setActiveModelConfig(id: string) {
  return api.post(`/model-configs/${id}/activate`)
}

export function testModelConfig(id: string) {
  return api.post(`/model-configs/${id}/test`)
}

export default api
