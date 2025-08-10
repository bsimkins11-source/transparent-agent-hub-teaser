import axios from 'axios'
import { Agent } from '../types/agent'

// Filter interfaces for type safety
interface AgentFilters {
  search?: string;
  category?: string;
  provider?: string;
  tier?: string;
  visibility?: string;
}

interface AdminLogFilters {
  level?: string;
  component?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const fetchAgents = async (filters?: AgentFilters) => {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value as string)
    })
  }
  
  const response = await api.get(`/api/agents?${params.toString()}`)
  return response.data
}

export const fetchAgent = async (id: string) => {
  const response = await api.get(`/api/agents/${id}`)
  return response.data.agent
}

export const interactWithAgent = async (agentId: string, message: string, context?: string) => {
  const response = await api.post(`/api/agents/${agentId}/interact`, {
    message,
    context
  })
  return response.data.response
}

export const fetchCategories = async () => {
  const response = await api.get('/api/agents/categories')
  return response.data.categories
}

export const fetchProviders = async () => {
  const response = await api.get('/api/agents/providers')
  return response.data.providers
}

// Admin API calls
export const fetchAdminAgents = async () => {
  const response = await api.get('/api/admin/agents')
  return response.data.agents
}

export const createAgent = async (agentData: Partial<Agent>) => {
  const response = await api.post('/api/admin/agents', agentData)
  return response.data
}

export const updateAgent = async (id: string, agentData: Partial<Agent>) => {
  const response = await api.put(`/api/admin/agents/${id}`, agentData)
  return response.data
}

export const deleteAgent = async (id: string) => {
  const response = await api.delete(`/api/admin/agents/${id}`)
  return response.data
}

export const fetchAdminLogs = async (filters?: AdminLogFilters) => {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value as string)
    })
  }
  
  const response = await api.get(`/api/admin/logs?${params.toString()}`)
  return response.data.logs
}

export const fetchAdminStats = async () => {
  const response = await api.get('/api/admin/stats')
  return response.data
}
