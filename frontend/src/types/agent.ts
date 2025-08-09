export interface Agent {
  id: string
  name: string
  description: string
  provider: 'openai' | 'google' | 'anthropic'
  route: string
  metadata: {
    tags: string[]
    category: string
    tier?: 'free' | 'premium' | 'enterprise'
    permissionType?: 'free' | 'direct' | 'approval'
  }
  visibility: 'public' | 'private'
  allowedRoles?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface AgentInteraction {
  message: string
  response: string
  timestamp: string
}

export interface FilterState {
  category: string
  provider: string
  search: string
}
