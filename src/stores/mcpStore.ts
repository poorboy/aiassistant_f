import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MCPConn {
  id: string
  name: string
  type: string
  command: string
  args: string
  sse_url: string
  status: string
}

export const useMCPStore = defineStore('mcp', () => {
  const connections = ref<MCPConn[]>([])
  const enabledTools = ref<string[]>([])

  function setConnections(list: MCPConn[]) {
    connections.value = list
  }

  return { connections, enabledTools, setConnections }
})
