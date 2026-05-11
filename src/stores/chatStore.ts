import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  toolCalls?: any
}

export interface Conversation {
  id: string
  title: string
  message_count: number
  created_at: string
  updated_at: string
}

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Conversation[]>([])
  const currentConvId = ref<string>('')
  const messages = ref<ChatMessage[]>([])
  const isStreaming = ref(false)

  function addMessage(msg: ChatMessage) {
    messages.value.push(msg)
  }

  function appendToLast(content: string) {
    const last = messages.value[messages.value.length - 1]
    if (last) last.content += content
  }

  function setMessages(msgs: ChatMessage[]) {
    messages.value = msgs
  }

  function clearMessages() {
    messages.value = []
  }

  function setConversations(list: Conversation[]) {
    conversations.value = list
  }

  function updateConversation(id: string, title: string) {
    const c = conversations.value.find(x => x.id === id)
    if (c) c.title = title
  }

  function addConversation(c: Conversation) {
    conversations.value.unshift(c)
  }

  function removeConversation(id: string) {
    conversations.value = conversations.value.filter(x => x.id !== id)
  }

  return {
    conversations, currentConvId, messages, isStreaming,
    addMessage, appendToLast, setMessages, clearMessages,
    setConversations, updateConversation, addConversation, removeConversation,
  }
})
