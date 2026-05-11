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

const defaultConns: MCPConn[] = [
  {
    id: 'blender',
    name: 'Blender',
    type: 'stdio',
    command: 'blender',
    args: '["--background", "--python", "mcp_server.py"]',
    sse_url: '',
    status: 'disconnected',
  },
  {
    id: 'gimp',
    name: 'GIMP',
    type: 'stdio',
    command: 'gimp',
    args: '["--no-interface", "--batch-interpreter", "python-fu-eval", "-"]',
    sse_url: '',
    status: 'disconnected',
  },
]

export const useMCPStore = defineStore('mcp', () => {
  const connections = ref<MCPConn[]>(defaultConns.map(c => ({ ...c })))
  const enabledTools = ref<string[]>([])
  const availableTools = ref<string[]>([])

  function setConnections(list: MCPConn[]) {
    connections.value = list
  }

  function resetDefaults() {
    connections.value = defaultConns.map(c => ({ ...c }))
  }

  function toggleTool(name: string) {
    const idx = enabledTools.value.indexOf(name)
    if (idx >= 0) {
      enabledTools.value.splice(idx, 1)
    } else {
      enabledTools.value.push(name)
    }
  }

  return { connections, enabledTools, availableTools, setConnections, resetDefaults, toggleTool }
})
