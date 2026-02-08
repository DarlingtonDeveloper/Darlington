export interface Worker {
  id: string
  persona: string
  status: 'idle' | 'busy' | 'error' | 'offline'
  task: string | null
  startedAt: string | null
}

export interface Channel {
  id: string
  name: string
  type: 'whatsapp' | 'web' | 'discord' | 'telegram' | 'signal'
  connected: boolean
}

export type OcConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'
