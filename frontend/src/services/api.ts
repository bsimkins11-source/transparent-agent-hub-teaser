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
  try {
    // Try to make the actual API call
    const response = await api.post(`/api/agents/${agentId}/interact`, {
      message,
      context
    })
    return response.data.response
  } catch (error) {
           // Fallback to mock response if backend is not available
       console.log('ℹ️ Backend not running - using demo mode with mock responses');
    
    // Mock responses for different agents
    if (agentId === 'gemini-chat-agent') {
      const mockResponses = [
        "Hello! I'm Gemini, your AI assistant. I can help you with various tasks, answer questions, and engage in meaningful conversations. What would you like to know?",
        "That's an interesting question! Let me help you with that. I have access to a wide range of information and can assist with creative tasks, research, coding, and general knowledge.",
        "I'm here to help! Whether you need assistance with writing, analysis, problem-solving, or just want to chat, I'm ready to engage. What's on your mind?",
        "Great question! I'm designed to be helpful, informative, and engaging. I can assist with everything from simple queries to complex problem-solving tasks.",
        "I appreciate your message! I'm here to provide helpful, accurate, and engaging responses. How can I assist you today?"
      ];
      
      // Return a random mock response
      const randomIndex = Math.floor(Math.random() * mockResponses.length);
      return mockResponses[randomIndex];
    }
    
    // Generic mock response for other agents
    return `Thank you for your message: "${message}". I'm currently in demo mode and will process your request when the backend is available.`;
  }
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

// Utility function to check and refresh authentication
export const checkAndRefreshAuth = async () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.log('🔍 No auth token found - user needs to log in');
    return false;
  }
  
  // Check if token is expired (Firebase tokens expire after 1 hour)
  try {
    // Decode the JWT token to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) {
      console.log('🔍 Token expired, removing from localStorage');
      localStorage.removeItem('authToken');
      return false;
    }
    
    console.log('✅ Token is valid, expires at:', new Date(payload.exp * 1000));
    return true;
  } catch (error) {
    console.error('❌ Error checking token validity:', error);
    localStorage.removeItem('authToken');
    return false;
  }
};

// User Library Management API calls
export const addAgentToUserLibrary = async (agentId: string, assignmentReason?: string) => {
  // Debug authentication state
  const token = localStorage.getItem('authToken');
  console.log('🔍 Debug: addAgentToUserLibrary called with:', {
    agentId,
    assignmentReason,
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
  });
  
  if (!token) {
    console.error('❌ No auth token found in localStorage');
    throw new Error('Authentication required. Please log in again.');
  }
  
  try {
    const response = await api.post(`/api/agents/${agentId}/add-to-library`, {
      assignmentReason
    });
    console.log('✅ addAgentToUserLibrary success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ addAgentToUserLibrary failed:', {
      error,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
  }
};

export const removeAgentFromUserLibrary = async (agentId: string) => {
  // Debug authentication state
  const token = localStorage.getItem('authToken');
  console.log('🔍 Debug: removeAgentFromUserLibrary called with:', {
    agentId,
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
  });
  
  if (!token) {
    console.error('❌ No auth token found in localStorage');
    throw new Error('Authentication required. Please log in again.');
  }
  
  try {
    const response = await api.delete(`/api/agents/${agentId}/remove-from-library`);
    console.log('✅ removeAgentFromUserLibrary success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ removeAgentFromUserLibrary failed:', {
      error,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
  }
};

export const fetchUserLibrary = async () => {
  const response = await api.get('/api/agents/user-library');
  return response.data;
};
